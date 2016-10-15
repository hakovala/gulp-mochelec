"use strict";

const gulp = require('gulp');
const mochaElectron = require('../');

gulp.task('test:main', () => {
	gulp.src('main/', { read: false })
		.pipe(mochaElectron({
			colors: true,
			timeout: 10000,
		}));
});

gulp.task('test:renderer', () => {
	gulp.src('renderer/*.js', { read: false})
		.pipe(mochaElectron({
			colors: true,
			renderer: true,
			timeout: 10000,
		}));
});

gulp.task('test', ['test:main', 'test:renderer']);
