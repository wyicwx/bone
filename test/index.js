'use strict';
var assert = require('assert'),
	bone = require('../index.js'),
	path = require('path'),
	glob = require('glob'),
	Stream = require('stream').Stream,
	_ = require('underscore'),
	fs = require('fs'),
	os = require('os');

require('./bonefile.js');
bone.setup('./test/raw');

describe('bone.setup', function() {
	it('placeholder', function() {
		console.log(bone.fs.files);
	});
});

describe('bone.dest', function() {
	it('dest() define a folder when do not call src()', function() {
		var result = bone.fs.existFile('~/dev/hello.js', {notFs: true});

		if(result) {
			assert.ok(true);
		} else {
			assert.ok(false);
		}
	});

	it('dest() define a folder when src() input a glob string', function() {

	});

	it('src() pass non-string parameter will throw new error', function() {
		assert.throws(function() {
			bone.dest('~/dist')
				.src(['~/src/empty/js.js']);
		});
	});
});

describe('bone.fs', function() {
	describe('createReadStream', function() {
		it('read a exist or defined file will return a stream obj', function() {
			var stream = bone.fs.createReadStream('~/dist/js/hello.js');
			if(stream instanceof Stream) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('read a not exist file will throw error', function() {
			assert.throws(function() {
				bone.fs.createReadStream('~/dist/not/exist/file.js');
			});
		});

		it('read a empty file return a valid stream(will trigger "end" event)', function(done) {
			var stream = bone.fs.createReadStream('~/dist/empty/js.js');
			var avild = true;
			stream.on('data', function() {
				done(false);
				avild = false;
			});

			stream.on('end', function() {
				if(avild) {
					done();
				}
			});
		});

		it('read a virtual file is viable', function(done) {
			var stream = bone.fs.createReadStream('~/dist/js/hello.js');

			stream.on('data', function() {
				done();
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
				bone.fs.rm('~/dist/not/exist');
				bone.fs.createWriteStream('~/dist/not/exist/File.js');
			});
		});

		it('use focus param to create folder and create write stream', function() {
			var dir = '~/dist/not/exist';
			var file = path.join(dir, '/file.js');

			bone.fs.rm(dir);

			assert.doesNotThrow(function() {			
				var stream = bone.fs.createWriteStream(file, {focus: true});
				fs.existsSync(file);

				bone.fs.rm(dir);
			});
		});
	});

	describe('readFile', function() {
		it('read a not exist file will throw error', function() {
			assert.throws(function() {
				bone.fs.readFile('~/dist/not/exist/file.js');
			});
		});

		it('read a empty file', function(done) {
			var content = fs.readFileSync(bone.fs.pathResolve('~/src/empty/js.js'));
			bone.fs.readFile('~/dist/empty/js.js', function(err, c) {
				if(content.toString() == c.toString()) {
					done();
				} else {
					done(false);
				}
			});
		});

		it('read a virtual file as same as real file', function(done) {
			var content = fs.readFileSync(bone.fs.pathResolve('~/src/js/hello.js'));

			bone.fs.readFile('~/dist/js/hello.js', function(err, result) {
				if(result.toString() == content.toString()) {
					done();
				} else {
					done(false);
				}
			});
		});
	});

	describe('search', function() {
		it('result correct', function() {
			var vresult = bone.fs.search('~/src/**/*');
			var rresult = glob.sync(bone.fs.pathResolve('~/src/**/*'));

			if(ArrayContain(vresult, rresult)) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});
	});

	describe('readDir', function() {
		it('read virtual folder', function() {
			var content = bone.fs.readDir('~/search');
			var vcontent = fs.readdirSync(bone.fs.pathResolve('~/src/'));
			
			if(ArrayContain(content, vcontent)) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});
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
	it('support glob syntax', function() {
		var files = bone.project('dist');
		var searchResult = bone.fs.search('~/dist/**/*');

		if(ArrayContain(files, searchResult)) {
			assert.ok(true);
		} else {
			assert.ok(false);
		}
	});
});

describe('bone.wrapper', function() {
	it('placeholder', function() {

	});
});

function ArrayContain(a, b) {
	var illagel = true;
	_.each(a, function(file) {
		if(!~_.indexOf(b, file)) {
			illagel = false;
		}
	});
	if(illagel) {
		return true;
	} else {
		return false;
	}
}
