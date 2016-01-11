'use strict';
var assert = require('assert');
var cache = require('../lib/cache.js');
var bone = require('../index.js');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Data = require('../lib/data.js');


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
        var trackFile = bone.utils.fs.track('dist/track/foo.js');

        if (trackFile.length == 3) {
            if (trackFile[0] == bonefs.pathResolve('dist/track/foo.js')) {
                if (trackFile[1] == bonefs.pathResolve('dist/single/foo.js')) {
                    if (trackFile[2] == bonefs.pathResolve('src/single/foo.js')) {
                        return assert.ok(true);
                    }
                }
            }
        }

        assert.ok(false);
    });

    it('track a rename virtual file', function() {
        var trackFile = bone.utils.fs.track('dist/track/bar.js');

        if (trackFile.length == 4) {
            if (trackFile[0] == bonefs.pathResolve('dist/track/bar.js')) {
                if (trackFile[1] == bonefs.pathResolve('dist/single/zoo.js')) {
                    if (trackFile[2] == bonefs.pathResolve('dist/single/foo.js')) {
                        if (trackFile[3] == bonefs.pathResolve('src/single/foo.js')) {
                            return assert.ok(true);
                        }
                    }
                }
            }
        }
        assert.ok(false);
    });

    it('track a not exist file will return false', function() {
        if (bone.utils.fs.track('~/dist/not/exist/file.js') === false) {
            assert.ok(true);
        } else {
            assert.ok(false);
        }
    });

    it('dependentFile', function(done) {
        bone.utils.fs.dependentFile('dist/dependencyFile/dependency.js', function(error, dependencies) {
            var dependencyFile = [
                bonefs.pathResolve('~/src/dependencyFile/foo.js'),
                bonefs.pathResolve('~/src/dependencyFile/dependency_a.js'),
                bonefs.pathResolve('~/src/dependencyFile/dependency_b.js')
            ];

            if(_.intersection(dependencies, dependencyFile).length == dependencyFile.length) {
                done();
            } else {
                done(false);
            }
        });
    });

    it('dependentFile a not exist file will return false', function(done) {
        bone.utils.fs.dependentFile('~/dist/not/exist/file.js', function(err) {
            if (err) {
                done();
            } else {
                done(false);
            }
        });
    });

    it('dependentFile multi times at same time', function(done) {
        var map = {};
        var end = function() {
            if (map.a && map.b) {
                if (map.a.length == 3 && map.b.length == 4) {
                    done();
                } else {
                    done(false);
                }
            }
        };

        bone.utils.fs.dependentFile('dist/dependencyFile/dependency.js', function(err, dependencies) {
            map.a = dependencies;
            end();
        });

        bone.utils.fs.dependentFile('dist/dependencyFile/dependency_2.js', function(err, dependencies) {
            map.b = dependencies;
            end();
        });
    });

    it('dependentFile virtual file what source is virtual file', function(done) {
        bone.utils.fs.dependentFile('dist/dependencyFile/dependency_3.js', function(error, dependencies) {
            var dependencyFile = [
                bonefs.pathResolve('~/src/dependencyFile/foo.js'),
                bonefs.pathResolve('~/src/dependencyFile/dependency_a.js'),
                bonefs.pathResolve('~/src/dependencyFile/dependency_b.js'),
                bonefs.pathResolve('~/src/dependencyFile/dependency_c.js')
            ];

            if(_.intersection(dependencies, dependencyFile).length == dependencyFile.length) {
                done();
            } else {
                done(false);
            }
        });
    });

    it('map2local virtual file', function(done) {
        var dirpath = bonefs.pathResolve('~/dist/single');
        var filepath = bonefs.pathResolve('~/dist/single/foo.js');

        bonefs.rm(dirpath);

        bone.utils.fs.map2local(filepath, function(error) {
            if (fs.existsSync(filepath)) {
                bonefs.rm(dirpath);
                done();
            } else {
                bonefs.rm(dirpath);
                done(false);
            }
        });
    });

    it('map2local real file', function(done) {
        bone.utils.fs.map2local('dist/single/foo.js', function(error) {
            if (error) {
                return done(false);
            }

            done();
        });
    });

    it('map2local not exist file', function(done) {
        bone.utils.fs.map2local('dist/notExist/foo.js', function(error) {
            if(error) {
                return done();
            }
            done(false);
        });
    });

    it('mapAll2local in act throw error', function(done) {
        bone.utils.fs.mapAll2local(function(error) {
            var File = require('../lib/file.js');

            _.each(File.fileList, function(item) {
                if (item.destination == 'plugins' && item.renameFn == 'error.js') {
                    File.fileList = _.without(File.fileList, item);
                }
            });
            bonefs.refresh();
            if(error) {
                done();
            } else {
                done(false);
            }
        });
    });

    it('mapAll2local', function(done) {
        var rmTmp = function() {
            bonefs.rm(path.join(__dirname, './raw/dist'));
            bonefs.rm(path.join(__dirname, './raw/cwd'));
            bonefs.rm(path.join(__dirname, './raw/dev'));
            bonefs.rm(path.join(__dirname, './raw/search'));
        };

        bone.watch.pause();

        rmTmp();
        bonefs.refresh();

        bone.utils.fs.mapAll2local(function(error, list) {
            if (error) {
                console.log(error);
                return done(false);
            }

            if (!list.length) {
                return done(false);
            }
            _.each(list, function(file) {
                if (!fs.existsSync(file)) {
                    assert.ok(false);
                }
            });

            rmTmp();
            bone.watch.resume();
            done();
        });
    });

    it('getAllVirtualFiles', function() {
        var FileSystem = require('../lib/fs.js');
        var filesF = _.keys(FileSystem.files);
        var files = bone.utils.fs.getAllVirtualFiles();

        if (files.length && ArrayContain(filesF, files)) {
            assert.ok(true);
        } else {
            assert.ok(false);
        }
    });

    it('getByDependent file', function() {
        var filePath = bonefs.pathResolve('~/src/single/foo.js');
        var files = bone.utils.fs.getByDependentFile(filePath);

        if (files.length <= 0) {
            assert.ok(false);
        }
        var intersection = _.intersection(files, [filePath]);
        if (intersection.length) {
            assert.ok(false);
        }
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
    if (option.strict) {
        if (a.length !== b.length) {
            illagel = false;
        }
    }
    _.each(a, function(file) {
        if (!~_.indexOf(b, file)) {
            illagel = false;
        }
    });
    if (illagel) {
        return true;
    } else {
        return false;
    }
}