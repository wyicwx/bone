'use strict';
var assert = require('assert'),
	bone = require('../index.js'),
	Stream = require('stream').Stream,
	os = require('os');

require('../example/bonefile.js');
bone.setup('./example');

describe('bone.setup', function() {

});

describe('bone.fs', function() {
	describe('createReadStream method', function() {
		it('create a exist file will return a stream obj', function() {
			var stream = bone.fs.createReadStream('dist/vendor/base-jquery-underscore-backbone-backbone.localStorage.js');
			if(stream instanceof Stream) {
				assert.ok(true);		
			} else {
				assert.ok(false);
			}
		});

		it('create a not exist file will throw error', function() {
			assert.throws(function() {
				bone.fs.createReadStream('dist/notExistFile.js');
			});
		});
	});

	describe('pathResolve', function() {
		it('separator only / characters are used! on windows characters \\ will be converted into / ', function() {
			if(!~os.platform().indexOf('win')) {
				var result = bone.fs.pathResolve('~\\test\\characters');

				if(result == '/test/characters') {
					assert.ok(true);
				} else {
					assert.ok(false);
				}
			} else {
				assert.ok(true);
			}
		});

		it('resolve ~ to bone\'s base path', function() {
			var resolveResult = bone.fs.pathResolve('~');

			if(resolveResult == bone.fs.base) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('resolve / to absolute path', function() {
			var resolveResult = bone.fs.pathResolve('/');

			if(resolveResult == '/') {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('resolve . default to bone\'s base path', function() {
			var resolveResult = bone.fs.pathResolve('.');

			if(resolveResult == bone.fs.base) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('resolve . to relative some path', function() {
			var resolveResult = bone.fs.pathResolve('./test', '/example');

			if(resolveResult == '/example/test') {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('resolve "" default to bone\'s base path', function() {
			var resolveResult = bone.fs.pathResolve('');

			if(resolveResult == bone.fs.base) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('support resolve ~ dir path', function() {
			var resolveResult = bone.fs.pathResolve('.', '~');

			if(resolveResult == bone.fs.base) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});
	});

	describe('createWriteStream', function() {
		it('xxx', function() {

		});
	});

	describe('readFile', function() {

	});

	describe('search', function() {

	});

	describe('readDir', function() {

	});
});

describe('bone.wrapper', function() {

});