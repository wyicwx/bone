'use strict';
var assert = require('assert'),
	bone = require('../index.js'),
	Stream = require('stream').Stream,
	fs = require('fs'),
	os = require('os');

require('../example/bonefile.js');
bone.setup('./example');

describe('bone.setup', function() {
	it('placeholder', function() {});
});

describe('bone.dest', function() {
	it('placeholder', function() {});
});

describe('bone.fs', function() {
	describe('createReadStream', function() {
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

		it('resolve ~folder to ~/folder', function() {
			var cresult = bone.fs.pathResolve('~folder');
			var sresult = bone.fs.pathResolve('~/folder');

			if(cresult == sresult) {
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
		it('create write stream under not exist folder will throw a error', function() {
			assert.throws(function() {
				bone.fs.rm('~/notExist');
				bone.fs.createWriteStream('~/notExist/File.js');
			});
		});

		it('use focus param to create folder and create write stream', function() {
			var dir = '~/notExist';
			var file = dir+'/File.js';

			bone.fs.rm(dir);

			assert.doesNotThrow(function() {			
				var stream = bone.fs.createWriteStream(file, {focus: true});
				fs.existsSync(file);

				bone.fs.rm(dir);
			});
		});
	});

	describe('readFile', function() {

	});

	describe('search', function() {

	});

	describe('readDir', function() {

	});

	describe('mkdir', function() {
		it('depend on the mkdirp libraries, only test ~ mkdir', function() {
			bone.fs.rm('~/mkdir');
			bone.fs.mkdir('~/mkdir');
			var dir = bone.fs.pathResolve('~/mkdir');
			try {
				var stat = fs.statSync(dir);
				if(stat.isDirectory()) {
					assert.ok(true);
				} else {
					assert.ok(false);
				}
			} catch(e) {
				assert.ok(false);
			}
			bone.fs.rm('~/mkdir');
		});
	});

	describe('rm', function() {
		it('support recursive delete file and folder', function() {
			bone.fs.mkdir('~/rm/subdir');
			var file1 = bone.fs.pathResolve('~/rm/toRm.js');
			fs.writeFileSync(file1, 'test');
			var file2 = bone.fs.pathResolve('~/rm/subdir/toRm.js');
			fs.writeFileSync(file2, 'test');

			bone.fs.rm('~/rm');
			var dir = bone.fs.pathResolve('~/rm');
			if(fs.existsSync(dir)) {
				assert.ok(false);
			} else {
				assert.ok(true);
			}
		});
	});
});

describe('bone.project', function() {
	it('placeholder', function() {});
});

describe('bone.wrapper', function() {
	it('placeholder', function() {});
});

