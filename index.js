"use strict";

const fs = require('fs');
const spawn = require('child_process').spawn;
const path = require('path');
const gutil = require('gulp-util');
const through = require('through2');
const toSpawnArgs = require('object-to-spawn-args');
const mochaElectron = require('mocha-electron');

const debug = require('debug')('gulp-mocha-electron');

const pluginName = require('./package.json').name;
const NODE_BIN = process.argv[0];

function gulpError(msg) {
	return new gutil.PluginError(pluginName, msg);
}

module.exports = function(mochaElectronOpts, opts)  {
	opts = opts || {};
	mochaElectronOpts = mochaElectronOpts || {};

	debug('opts: %o', opts);
	debug('mochaElectronOpts: %o', mochaElectronOpts);

	let args = [mochaElectron].concat(toSpawnArgs(mochaElectronOpts));
	let files = [];

	// collect test files to run them in a batch
	function collectTests(file, enc, cb) {
		files.push(file.path);
		cb();
	}

	function runTests(files, stream, cb) {
		debug('test files: %o', files);
		let child = spawn(NODE_BIN, args.concat(files), { env: process.env });

		if (!opts.suppressStdout) {
			child.stdout.pipe(process.stdout);
		}
		if (!opts.suppressStderr) {
			child.stderr.pipe(process.stderr);
		}

		child.stdout.on('data', stream.emit.bind(stream, 'mochaElectronStdoutData'));
		child.stdout.on('end', stream.emit.bind(stream, 'mochaElectronStdoutEnd'));

		child.stderr.on('data', stream.emit.bind(stream, 'mochaElectronStderrData'));
		child.stderr.on('end', stream.emit.bind(stream, 'mochaElectronStderrEnd'));

		child.on('error', stream.emit.bind(stream, 'mochaElectronError'));
		child.on('exit', stream.emit.bind(stream, 'mochaElectronExit'));

		child.on('error', (err) => {
			cb(new gutil.PluginError(err.message));
		});
		child.on('exit', (code) => {
			let err;
			if (code !== 0 && !opts.silent) {
				err = gulpError('Tests failed, failed count: ' + code);
			}
			cb(err);
		});
	}

	return through.obj(collectTests, function(cb) {
		runTests(files, this, (err) => {
			if (err) return cb(err);
			this.push(files);
			cb();
		});
	});
};
