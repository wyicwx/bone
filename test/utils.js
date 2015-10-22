'use strict';
var assert = require('assert');
var cache = require('../lib/cache.js');
var bone = require('../index.js');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');


bone.status.test = true;
bone.status.watch = true;
describe('bone.utils', function() {
	var bonefs;
	var FileSystem;

	before(function() {
		FileSystem = require('../lib/fs.js');
		bonefs = FileSystem.getFs();
	});

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

	it('dependentFile a not exist file will return false', function(done) {
		bone.utils.fs.dependentFile('~/dist/not/exist/file.js', function(err) {
			if(err) {
				done();
			} else {
				done(false);
			}
		});
	});

	it('dependentFile multi times at same time', function(done) {
		var map = {};
		var end = function() {
			if(map.a && map.b) {
				if(map.a.length == 3 && map.b.length == 4) {
					done();
				} else {
					done(false);
				}
			}
			
		};
		bone.utils.fs.dependentFile('dev/dependentFile/hello.js', function(err, dependencies) {
			map.a = dependencies;
			end();
		});

		bone.utils.fs.dependentFile('dev/dependentFile/foo.js', function(err, dependencies) {
			map.b = dependencies;
			end();
		});
	});

	it('map2local ', function(done) {
		var dirpath = path.join(__dirname, './raw/dist/js');
		var filepath = path.join(dirpath, 'hello.js');

		bonefs.rm(dirpath);

		bone.utils.fs.map2local('dist/js/hello.js', function(error) {
			if(fs.existsSync(filepath)) {
				bonefs.rm(dirpath);
				done();
			} else {
				bonefs.rm(dirpath);
				done(false);
			}
		}, {slient: true});
	});

	it('mapAll2local ', function(done) {
		var rmTmp = function() {
			bonefs.rm(path.join(__dirname, './raw/dist'));
			bonefs.rm(path.join(__dirname, './raw/cdist'));
			bonefs.rm(path.join(__dirname, './raw/cwd'));
			bonefs.rm(path.join(__dirname, './raw/dev'));
			bonefs.rm(path.join(__dirname, './raw/search'));	
		};

		bone.helper.autoRefreshStop();

		rmTmp();
		bonefs.refresh();

		bone.utils.fs.mapAll2local(function(error, list) {
			if(error) {
				console.log(error);
				return done(false);
			}

			_.each(list, function(file) {
				if(!fs.existsSync(file)) {
					assert.ok(false);
				}
			});

			rmTmp();
			done();
		}, {slient: true});
	});
});

describe('bone.debug', function() {
	it('showMem', function() {
		bone.status.debug = true;
		assert.doesNotThrow(function() {
			bone.utils.debug.showMem();
			bone.status.debug = false;
		});
	});
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