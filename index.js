"use strict";

const fs = require('fs');
const spawn = require('child_process').spawn;
const path = require('path');
const gutil = require('gulp-util');
const through = require('through2');
const toSpawnArgs = require('object-to-spawn-args');
const mochelec = require('mochelec');

const pluginName = require('./package.json').name;
const NODE_BIN = process.argv[0];

const debug = require('debug')(pluginName);

function gulpError(msg) {
	return new gutil.PluginError(pluginName, msg);
}

module.exports = function(mochelecOpts, opts)  {
	opts = opts || {};
	mochelecOpts = mochelecOpts || {};

	debug('opts: %o', opts);
	debug('mochelecOpts: %o', mochelecOpts);

	let args = [mochelec].concat(toSpawnArgs(mochelecOpts));
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

		child.stdout.on('data', stream.emit.bind(stream, 'mochelecStdoutData'));
		child.stdout.on('end', stream.emit.bind(stream, 'mochelecStdoutEnd'));

		child.stderr.on('data', stream.emit.bind(stream, 'mochelecStderrData'));
		child.stderr.on('end', stream.emit.bind(stream, 'mochelecStderrEnd'));

		child.on('error', stream.emit.bind(stream, 'mochelecError'));
		child.on('exit', stream.emit.bind(stream, 'mochelecExit'));

		child.on('error', (err) => {
			debug('error: %s', err.message);
			cb(gulpError(err.message));
		});
		child.on('exit', (code) => {
			debug('exit: %d', code);
			let err;
			if (code !== 0 && !opts.silent) {
				err = gulpError(code + ' tests failed');
				err.count = code;
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
