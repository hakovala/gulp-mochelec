"use strict";

const assert = require('assert');

describe('renderer process', () => {
	it('can do stuff', () => {
		assert(1 + 1 === 2);
	});

	it('can do stuff later', (done) => {
		setTimeout(done, 10);
	});

	it('has LocalStorage', () => {
		window.localStorage.setItem('foo', 'bar');
		assert.equal(window.localStorage.getItem('foo'), 'bar');
	});

	it('has document', () => {
		assert.strictEqual(document.body.tagName.toLowerCase(), 'body');
	});

	it('can create elements', () => {
		let el = document.createElement('div');
		el.dataset.foo = 'bar';
		assert.equal(el.getAttribute('data-foo'), 'bar');
	});
});
