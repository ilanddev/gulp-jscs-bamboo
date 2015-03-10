# gulp-jscs-bamboo

> Check JavaScript code style with [jscs](https://github.com/jscs-dev/node-jscs)

*Issues with the output should be reported on the jscs [issue tracker](https://github.com/jscs-dev/node-jscs/issues).*


## Install

```sh
$ npm install --save-dev gulp-jscs-bamboo
```


## Usage

```js
var gulp = require('gulp');
var jscsBamboo = require('gulp-jscs-bamboo');

gulp.task(
  'jscs',
  function() {
    return gulp.src([
      './dev/*.js',
      './dev/**/*.js',
      '!/dev/libs/**/*.js'
    ])
    .pipe(jscsBamboo())
  }
);
```

## Results

[mocha-bamboo-reporter](https://github.com/issacg/mocha-bamboo-reporter)

## License

CC BY 3.0