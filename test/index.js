'use strict';
var assert = require('assert'),
	bone = require('../index.js'),
	path = require('path'),
	glob = require('glob'),
	Stream = require('stream').Stream,
	_ = require('underscore'),
	fs = require('fs'),
	os = require('os'),
	bonefs;

require('./bonefile.js');
bone.status.test = true;
describe('bone.setup', function() {
	it('correct', function() {
		assert.doesNotThrow(function() {
			bone.setup('./test/raw');
			var FileSystem = require('../lib/fs.js');
			bonefs = FileSystem.getFs();
		});
	});
});

describe('bone.dest', function() {
	it('dest() define a parent folder when do not call src()', function() {
		var result = bonefs.existFile('~/dev/js/hello.js', {notFs: true});

		if(result) {
			assert.ok(true);
		} else {
			assert.ok(false);
		}
	});

	it('dest() define a folder when call src()', function() {
		var result = bonefs.existFile('~/dev/css.css', {notFs: true});
		if(result) {
			assert.ok(true);
		} else {
			assert.ok(false);
		}
	});

	it('src() pass string or string array parameter only', function() {
		assert.throws(function() {
			bone.dest('~/dist')
				.src({});
		});

		assert.throws(function() {
			bone.dest('~/dist')
				.src([null, undefined]);
		});
	});

	it('single file define', function() {
		var exist = bonefs.existFile('~/dist/js/main.js');

		if(exist) {
			assert.ok(true);
		} else {
			assert.ok(false);
		}
	});

	it('use glob to map file of define file', function() {
		var exist = bonefs.existFile('~/cdist/js/main.js');

		if(exist) {
			assert.ok(true);
		} else {
			assert.ok(false);
		}
	});

	it('rename() pass non-string or non-function parameter will throw error', function() {
		assert.throws(function() {
			bone.dest('~/dist')
				.src(['~/src/rename/js.js'])
				.rename({});
		});

		assert.throws(function() {
			bone.dest('~/dist')
				.src(['~/src/rename/js.js'])
				.rename(1);
		});
	});

	it('act() process source file', function(done) {
		bonefs.readFile('~/dev/js/hello_sign.js', function(err, buffer) {
			var content = buffer.toString();

			if(~content.search('@author wyicwx')) {
				done();
			} else {
				done(false);
			}
		});
	});

	it('multi act() process source file', function(done) {
		bonefs.readFile('~/dev/js/hello_sign_copyright.js', function(err, buffer) {
			var content = buffer.toString();

			if(~content.search('@copyright wyicwx')) {
				done();
			} else {
				done(false);
			}
		});
	});

	it('call rename() , act() and destroy() before src()  will throw error', function() {
		assert.throws(function() {
			bone.dest('dist')
				.rename();
		});

		assert.throws(function() {
			bone.dest('dist')
				.act();
		});

		assert.throws(function() {
			bone.dest('dist')
				.destroy();
		});
	});

	it('act() processor non-params', function(done) {
		var track = bone.utils.fs.track('~/dev/js/hello_sign-noparam.js');
		bonefs.readFile('~/dev/js/hello_sign-noparam.js', function(err, buffer) {
			var content = buffer.toString();
			if(~content.search('@author anonymous')) {
				done();
			} else {
				done(false);
			}
		});
	});

	it('cwd() change work directory', function() {
		var cwdret = bonefs.search('~/cwd/all/**/*');
		var origret = bonefs.search('~/src/**/*');

		if(cwdret.length === origret.length) {
			assert.ok(true);
		} else {
			assert.ok(false);
		}
	});

	it('cwd() copy subfolder', function() {
		if(bonefs.existFile('~/cwd/folder/js/hello.js')) {
			assert.ok(true);
		} else {
			assert.ok(false);
		}
	});

	it('throw error when call cwd() after src()!', function() {
		assert.throws(function() {
			bone.dest('cwd/src')
				.src('~/src/**')
				.cwd('~/src');
		});
	});

	it('throw error define over file', function() {
		var file;
		assert.throws(function() {
			file = bone.dest('dist/js')
			.src('~/src/js/hello.js')
			.rename('main.js');

			bonefs.refresh();
		});
		file.destroy();
		bonefs.refresh();
	});

	it('throw error when over reference file', function(done) {
		bonefs.readFile('~/overReferences/bar.js', function(error, data) {
			if(error) {
				done();
			} else {
				done(false);
			}
		});
	});
});

describe('bone.fs', function() {
	describe('createReadStream', function() {
		it('read a exist or defined file will return a stream obj', function() {
			var stream = bonefs.createReadStream('~/dist/js/hello.js');
			if(stream instanceof Stream) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('read a not exist file will throw error', function() {
			assert.throws(function() {
				bonefs.createReadStream('~/dist/not/exist/file.js');
			});
		});

		it('read a empty file return a valid stream(will trigger "end" event)', function(done) {
			var stream = bonefs.createReadStream('~/dist/empty/js.js');
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
			var stream = bonefs.createReadStream('~/dist/js/hello.js');

			stream.on('data', function() {
				done();
			});
		});

		it('read a file what mapping from virtual file', function() {
			if(bonefs.existFile('dev/track/hello.js', {notFs: true})) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});
	});

	describe('pathResolve', function() {
		it('separator only / characters are used! on windows characters \\ will be converted into / ', function() {
			if(os.platform().indexOf('win') == 0) {
				var result = bonefs.pathResolve('~\\test\\characters');

				if(result == bonefs.pathResolve(path.join(bonefs.base, '/test/characters'))) {
					assert.ok(true);
				} else {
					assert.ok(false);
				}
			} else {
				assert.ok(true);
			}
		});

		it('resolve ~ to bone\'s base path', function() {
			var resolveResult = bonefs.pathResolve('~');

			if(resolveResult == bonefs.base) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('resolve ~folder to ~/folder', function() {
			var cresult = bonefs.pathResolve('~folder');
			var sresult = bonefs.pathResolve('~/folder');

			if(cresult == sresult) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('resolve / to absolute path', function() {
			var resolveResult = bonefs.pathResolve('/');

			if(resolveResult == bonefs.pathResolve(path.resolve('/'))) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('resolve . default to bone\'s base path', function() {
			var resolveResult = bonefs.pathResolve('.');

			if(resolveResult == bonefs.base) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('resolve . to relative some path', function() {
			var resolveResult = bonefs.pathResolve('./test', '/example');

			if(resolveResult == bonefs.pathResolve(path.resolve('/example/test'))) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('resolve "" default to bone\'s base path', function() {
			var resolveResult = bonefs.pathResolve('');

			if(resolveResult == bonefs.base) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});

		it('support resolve ~ dir path', function() {
			var resolveResult = bonefs.pathResolve('.', '~');

			if(resolveResult == bonefs.base) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});
	});

	describe('createWriteStream', function() {
		it('create write stream under not exist folder will throw a error', function() {
			assert.throws(function() {
				bonefs.rm('~/dist/not/exist');
				bonefs.createWriteStream('~/dist/not/exist/File.js');
			});

		});

		it('use focus param to create folder and create write stream', function() {
			var dir = '~/dist/not/exist';
			var file = path.join(dir, '/file.js');

			bonefs.rm(dir);

			assert.doesNotThrow(function() {			
				var stream = bonefs.createWriteStream(file, {focus: true});
				stream.write('\r\n');
				stream.end();
				fs.existsSync(file);
			});
		});
	});

	describe('readFile', function() {
		it('read a not exist file will throw error', function(done) {
			var file = '~/dist/not/exist/file.js';
			bonefs.rm(file);
			bonefs.readFile(file, function(error, data) {
				if(error) {
					done();
				} else {
					done(false);
				}
			});
		});

		it('read a empty file', function(done) {
			var content = fs.readFileSync(bonefs.pathResolve('~/src/empty/js.js'));
			bonefs.readFile('~/dist/empty/js.js', function(err, c) {
				if(content.toString() == c.toString()) {
					done();
				} else {
					done(false);
				}
			});
		});

		it('read a virtual file as same as real file', function(done) {
			var content = fs.readFileSync(bonefs.pathResolve('~/src/js/hello.js'));

			bonefs.readFile('~/dist/js/hello.js', function(err, result) {
				if(result.toString() == content.toString()) {
					done();
				} else {
					done(false);
				}
			});
		});
	});

	describe('writeFile', function() {
		it('write file and create folder', function() {
			bonefs.rm('~/folder');
			bonefs.writeFile('~/folder/foo.js', 'test', {focus: true});

			if(fs.existsSync(bonefs.pathResolve('~/folder/foo.js'))) {
				process.nextTick(function() {
					bonefs.rm('~/folder');
				});
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});
	});

	describe('search', function() {
		it('result correct', function() {
			var vresult = bonefs.search('~/src/**/*');
			var rresult = glob.sync(bonefs.pathResolve('~/src/**/*'));

			if(ArrayContain(vresult, rresult)) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});
	});

	describe('readDir', function() {
		it('read virtual folder', function(done) {
			var content = bonefs.readDir('~/search');
			var vcontent = fs.readdirSync(bonefs.pathResolve('~/src/'));

			if(ArrayContain(content, vcontent, {strict: true})) {
				done();
			} else {
				done(false);
			}
		});
	});

	describe('mkdir', function() {
		it('depend on the mkdirp libraries, only test ~ mkdir', function() {
			bonefs.rm('~/mkdir');
			bonefs.mkdir('~/mkdir');
			var dir = bonefs.pathResolve('~/mkdir');
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
			bonefs.rm('~/mkdir');
		});
	});

	describe('rm', function() {
		it('support recursive delete file and folder', function() {
			bonefs.mkdir('~/rm/subdir');
			var file1 = bonefs.pathResolve('~/rm/toRm.js');
			fs.writeFileSync(file1, 'test');
			var file2 = bonefs.pathResolve('~/rm/subdir/toRm.js');
			fs.writeFileSync(file2, 'test');

			bonefs.rm('~/rm');
			var dir = bonefs.pathResolve('~/rm');
			if(fs.existsSync(dir)) {
				assert.ok(false);
			} else {
				assert.ok(true);
			}
		});
	});

	describe('refresh', function() {
		it('to refresh glob match file(not exist before)', function() {
			var file = bonefs.pathResolve('~/src/js/afterAdd.js');
			fs.writeFileSync(file, 'test');
			bonefs.refresh();
			var exist = bonefs.existFile(file)
			bonefs.rm(file);
			if(exist) {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
		});
	});
});

describe('bone.project', function() {
	it('support glob syntax', function() {
		var files = bone.project('dist');
		var searchResult = bonefs.search('~/dist/**/*');
		searchResult = _.filter(searchResult, function(file) {
			return bonefs.existFile(file);
		});
		if(ArrayContain(files, searchResult, {strict: true})) {
			assert.ok(true);
		} else {
			assert.ok(false);
		}
	});

	it('array as option', function() {
		var files = bone.project('distArray');
	});

	it('files empty', function() {
		var files = bone.project('emptyProject');

		if(_.isUndefined(files)) {
			return assert.ok(true);
		}

		assert.ok(false);
	});
});

describe('bone.helper', function() {
	describe('wrapper', function() {
		it('option.defaults() set default value for some key', function(done) {
			bonefs.readFile('~/dev/js/hello_copyright_default.js', function(err, buffer) {
				var content = buffer.toString();

				if(~content.search('@copyright anonymous')) {
					done();
				} else {
					done(false);
				}
	 		});
		});

		it('concat multi plugin to one', function(done) {
			bonefs.readFile('~/dev/js/hello_sign-copyright.js', function(err, buffer) {
				var content = buffer.toString();
				if(~content.search('@author wyicwx') && ~content.search('@copyright wyicwx')) {
					done();
				} else {
					done(false);
				}
			});
		});

		it('concat multi option fixed\'s plugin to one', function(done) {
			bonefs.readFile('~/dev/js/hello_sign-copyright-fixed-option.js', function(err, buffer) {
				var content = buffer.toString();

				if(~content.search('@author wyicwx') && ~content.search('@copyright wyicwx')) {
					done();
				} else {
					done(false);
				}
			});
		});
	});

	describe('autoRefresh', function() {
		it('run away', function() {
			assert.doesNotThrow(function() {
				bone.helper.autoRefresh(function(watcher) {
					if(!watcher) {
						throw new Error();
					}
				});
				bone.helper.autoRefresh(function(watcher) {
					if(!watcher) {
						throw new Error();
					}
				});
			});
		});
	});
});

describe('bone.utils', function() {
	it('track a virtual file', function() {
		var trackFile = bone.utils.fs.track('dev/track/hello.js');

		if(trackFile.length == 3) {
			if(trackFile[0] == bonefs.pathResolve('dev/track/hello.js')) {
				if(trackFile[1] == bonefs.pathResolve('dev/js/hello.js')) {
					if(trackFile[2] == bonefs.pathResolve('src/js/hello.js')) {
						return assert.ok(true);
					}
				}
			}
		}

		assert.ok(false);
	});

	it('track a rename virtual file', function() {
		var trackFile = bone.utils.fs.track('dev/trackRename/foo.js');

		if(trackFile.length == 4) {
			if(trackFile[0] == bonefs.pathResolve('dev/trackRename/foo.js')) {
				if(trackFile[1] == bonefs.pathResolve('dev/track/hello.js')) {
					if(trackFile[2] == bonefs.pathResolve('dev/js/hello.js')) {
						if(trackFile[3] == bonefs.pathResolve('src/js/hello.js')) {
							return assert.ok(true);
						}
					}
				}
			}
		}
		assert.ok(false);
	});

	it('track a not exist file will return false', function() {
		if(bone.utils.fs.track('~/dist/not/exist/file.js') === false) {
			assert.ok(true);
		} else {
			assert.ok(false);
		}
	});

	it('dependentFile', function(done) {
		bone.utils.fs.dependentFile('dev/dependentFile/hello.js', function(error, dependencies) {
			var dependentFile = [
				bonefs.pathResolve('~/src/project/file1.js'),
				bonefs.pathResolve('~/src/js/hello.js'),
				bonefs.pathResolve('~/src/css/css.css')
			];

			if(ArrayContain(dependentFile, dependencies)) {
				done();
			} else {
				done(false);
			}
		});
	});

	// it('dependentFile a not exist file will return false', function(done) {
	// 	bone.utils.fs.dependentFile('~/dist/not/exist/file.js', function(err) {
	// 		if(err) {
	// 			done();
	// 		} else {
	// 			done(false);
	// 		}
	// 	});
	// });

	// it('dependentFile multi times at same time', function(done) {
	// 	var map = {};
	// 	var end = function() {
	// 		if(map.a && map.b) {
	// 			if(map.a.length == 6 && map.b.length == 7) {
	// 				done();
	// 			} else {
	// 				done(false);
	// 			}
	// 		}
			
	// 	};
	// 	bone.utils.fs.dependentFile('dev/dependentFile/hello.js', function(err, dependencies) {
	// 		map.a = dependencies;
	// 		end();
	// 	});

	// 	bone.utils.fs.dependentFile('dev/dependentFile/foo.js', function(err, dependencies) {
	// 		map.b = dependencies;
	// 		end();
	// 	});
	// });
});

function ArrayContain(a, b, option) {
	option || (option = {});
	var illagel = true;
	if(option.strict) {
		if(a.length !== b.length) {
			illagel = false;
		}
	}
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
