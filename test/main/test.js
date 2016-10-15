"use strict";

const assert = require('assert');

describe('main process', () => {
	it('can do stuff', () => {
		assert(1 + 1 === 2);
	});

	it('can do stuff later', (done) => {
		setTimeout(done, 10);
	});

	it('has BrowserWindow', () => {
		let electron = require('electron');
		assert(electron);

		let BrowserWindow = electron.BrowserWindow;
		assert(BrowserWindow);
	});

	it('can create windows', () => {
		let err;

		try {
			let BrowserWindow = require('electron').BrowserWindow;
			let win = new BrowserWindow({width: 100, height: 100, show: false});
			win.close();
		} catch(e) {
			err = e;
		} finally {
			assert(err === undefined);
		}
	});
});
