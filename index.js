'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var Checker = require('jscs');
var loadConfigFile = require('jscs/lib/cli-config');
var path = require('path');
var fs = require('fs');
var assign = require('object-assign');

module.exports = function (options) {
	options = options || '.jscsrc';

	if (typeof options === 'string') {
		options = {configPath: options};
	}

	options = assign({esnext: false}, options);

	var checker = new Checker({esnext: !!options.esnext});

	checker.registerDefaultRules();

	var configPath = options.configPath;
	delete options.esnext;
	delete options.configPath;

	if (configPath) {
		if (Object.keys(options).length) {
			throw new Error('configPath option is not compatible with code style options');
		}

		checker.configure(loadConfigFile.load(configPath));
	} else {
		checker.configure(options);
	}

	var result = {
	  stats: {
	    'suites': 0,
	    'tests': 0,
	    'passes': 0,
	    'pending': 0,
	    'failures': 0,
	    'duration': 0
	  }
	};
	result.stats.start = result.stats.start || new global.Date();
	result.stats.end = result.stats.end || new global.Date();
	result.failures = [];
	result.passes = [];
	result.skipped = [];

	return through.obj(function (file, enc, cb) {
		var now = new global.Date();

		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-jscs', 'Streaming not supported'));
			return;
		}

		if (checker.getConfiguration().isFileExcluded(file.path)) {
			cb(null, file);
			return;
		}

		try {
			var errors = checker.checkString(file.contents.toString(), file.relative);
			var errorList = errors.getErrorList();
    
	    result.stats.suites = result.stats.suites + 1;
	    result.stats.tests = result.stats.tests + 1;
	    result.stats.end = now;
	    result.stats.duration = result.stats.end - result.stats.start;

			file.jscs = {
				success: true,
				errorCount: 0,
				errors: []
			};

			if (errorList.length > 0) {
				file.jscs.success = false;
				file.jscs.errorCount = errorList.length;
				file.jscs.errors = errorList;
			}

      if (errorList.length > 0) {
      	var reply = [];

				errorList.forEach(function (err) {
					var error = [
						(reply.length + 1) + '. ',
						'line ' + err.line + ', ',
						'char ' + err.column + ': ',
						err.rule + '(' + err.message + ')'
					];

					reply.push(error.join(''));
				});

				throw Error(reply.join('\n'));
      } else {
				result.stats.passes = result.stats.passes + 1;
      	result.passes.push({
					'title': 'JSCS ' + path.basename(file.path),
					'fullTitle': file.path,
					'duration': 0,
      	});
      }
		} catch (err) {
      result.stats.failures = result.stats.failures + 1;
			result.failures.push({
				'title': 'JSCS ' + path.basename(file.path),
				'fullTitle': file.path,
				'duration': 0,
				'error': 'null: ' + err
			});
		}

		cb(null, file);
	}, function (cb) {
		console.log(result);
		fs.writeFileSync(
			'jscs-report.json',
			JSON.stringify(result, null, 2),
			'utf-8'
		);

		cb();
	});
};
