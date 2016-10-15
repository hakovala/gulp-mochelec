"use stirct";

const assert = require('assert');
const spawn = require('child_process').spawn;
const through = require('through2');
const path = require('path');

describe('gulp-mocha-electron', () => {
	const tasks = {
		'test:main': 'can run mocha tests in main process',
		'test:renderer': 'can run mocha tests in renderer process',
	};

	Object.keys(tasks).forEach((task) => {
		it(tasks[task], (done) => {
			const gulp = spawn('gulp', [task, '--gulpfile', path.join(__dirname, 'gulpfile.js')]);

			const indent = through((chunk, enc, cb) => {
				cb(null, chunk.toString().replace(/^([^\t])/gm, '\t$1'));
			});

			gulp.stdout.pipe(indent).pipe(process.stdout);

			gulp.on('exit', (code) => {
				assert.equal(code, 0, 'Exit code should be 0 (pass)');
				done();
			});
		});
	});
});
