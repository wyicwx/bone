'use strict';
var assert = require('assert'),
    bone = require('../index.js'),
    path = require('path'),
    glob = require('glob'),
    Stream = require('stream').Stream,
    _ = require('lodash'),
    fs = require('fs'),
    os = require('os'),
    FileSystem = require('../lib/fs.js'),
    bonefs;

bone.setup('./test/raw');
bonefs = FileSystem.fs;

require('./bone/bonefile.js');

bone.status.test = true;
describe('bone.setup', function() {
    it('correct', function() {
        assert.doesNotThrow(function() {
            bone.run();
        });
    });
});

describe('bone.dest', function() {
    it('dest() define a parent folder when do not call src()', function() {
        var result = bonefs.existFile('~/dist/single/foo.js', {
            notFs: true
        });

        if (result) {
            assert.ok(true);
        } else {
            assert.ok(false);
        }
    });

    it('dest() define a folder when call src()', function() {
        var result = bonefs.existFile('~/dist/single/bar.js', {
            notFs: true
        });
        if (result) {
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
        var exist = bonefs.existFile('~/dist/single/foo.js');

        if (exist) {
            assert.ok(true);
        } else {
            assert.ok(false);
        }
    });

    it('use glob to map file of define file', function() {
        var exist = bonefs.existFile('~/dist/glob/foo.js');

        if (exist) {
            assert.ok(true);
        } else {
            assert.ok(false);
        }
    });

    it('rename() is runing correct', function() {
        if(!bonefs.existFile('~/dist/rename/foo.js')) {
            assert.ok(false);
        }
        if(!bonefs.existFile('~/dist/rename/base.jsx')) {
            assert.ok(false);
        }
        if(!bonefs.existFile('~/dist/rename/bar.js')) {
            assert.ok(false);
        }
        if(!bonefs.existFile('~/dist/rename/bar.jsx')) {
            assert.ok(false);
        }

        if(!bonefs.existFile('~/dist/rename/zoo.js')) {
            assert.ok(false);
        }
    });

    it('act() process source file', function(done) {
        bonefs.readFile('~/dist/plugins/author.js', function(err, buffer) {
            var content = buffer.toString();
            if (~content.search('@author wyicwx')) {
                done();
            } else {
                done(false);
            }
        });
    });

    it('multi act() process source file', function(done) {
        bonefs.readFile('~/dist/plugins/author_copyright.js', function(err, buffer) {
            var content = buffer.toString();

            if (~content.search('@copyright wyicwx')) {
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
        bonefs.readFile('~/dist/plugins/author_noparam.js', function(err, buffer) {
            var content = buffer.toString();
            if (~content.search('@author anonymous')) {
                done();
            } else {
                done(false);
            }
        });
    });

    it('cwd() change work directory', function() {
        var cwdret = bonefs.search('~/dist/cwd/all/**/*');
        var origret = bonefs.search('~/src/cwd/all/**/*');

        if (cwdret.length === origret.length) {
            assert.ok(true);
        } else {
            assert.ok(false);
        }
    });

    // it('cwd() copy subfolder', function() {
    //     if (bonefs.existFile('~/cwd/folder/js/hello.js')) {
    //         assert.ok(true);
    //     } else {
    //         assert.ok(false);
    //     }
    // });

    it("temp() should be not show in search's result", function() {
        var result = bonefs.search('~/temp/*');
        if (result.length) {
            assert.ok(false);
        }
    });

    it('temp() utils.fs.getAllVirtualFiles should be not show in result', function() {
        var result = bone.utils.fs.getAllVirtualFiles();

        result = _.filter(result, function(filePath) {
            if (filePath.indexOf('temp') != -1) {
                return true;
            } else {
                return false;
            }
        });

        if (result.length) {
            assert.ok(false);
        }
    });

    it('throw error when call cwd() after src()!', function() {
        assert.throws(function() {
            bone.dest('cwd/src')
                .src('~/src/**')
                .cwd('~/src');
        });

        var File = require('../lib/file.js');
        _.each(File.fileList, function(item) {
            if (item.destination == 'cwd/src') {
                File.fileList = _.without(File.fileList, item);
            }
        });
        bonefs.refresh();
    });

    it('throw error define over file', function() {
        var file;
        assert.throws(function() {
            file = bone.dest('dist/duplicateDefinition')
                .src('~/src/duplicateDefinition/foo.js');

            bonefs.refresh();
        });
        file.destroy();
        bonefs.refresh();
    });

    it('throw error when over reference file', function(done) {
        bonefs.readFile('~/src/overReferences/foo.js', function(error, data) {
            if (error) {
                if(error.message.indexOf('File over references') != -1) {
                    var File = require('../lib/file.js');
                    _.each(File.fileList, function(item) {
                        if (item.destination == 'src/overReferences') {
                            File.fileList = _.without(File.fileList, item);
                        }
                    });
                    done();
                } else {
                    done(false);
                }
            } else {
                done(false);
            }
        });
    });
});

describe('bone.fs', function() {
    describe('createReadStream', function() {
        it('read a exist or defined file will return a stream obj', function() {
            var stream = bonefs.createReadStream('~/dist/single/foo.js');
            if (stream instanceof Stream) {
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
                avild = false;
            });

            stream.on('end', function() {
                if (avild) {
                    done();
                } else {
                    done(false);
                }
            });
        });

        it('read a virtual file is viable', function(done) {
            var stream = bonefs.createReadStream('~/dist/temp/foo.js');

            stream.on('data', function() {
                done();
            });
        });

        it('read a file what mapping from virtual file', function() {
            if (bonefs.existFile('dist/single/zoo.js', {
                    notFs: true
                })) {
                assert.ok(true);
            } else {
                assert.ok(false);
            }
        });

        it('setting single defaultAct for fs', function(done) {
            var fs = FileSystem.getFs({
                defaultAct: bone.wrapper(function(buffer, encoding, callback) {
                    callback(null, buffer.toString() + '1');
                })
            });

            var avild = true;

            var stream = fs.createReadStream('~/src/js/hello.js');

            stream.on('data', function(trunk) {
                if (trunk.toString() != "alert('hello world!');1") {
                    avild = false;
                }
            });

            stream.on('end', function() {
                if (avild) {
                    done();
                } else {
                    done(false);
                }
            });
        });

        it('setting multi defaultAct for fs', function(done) {
            var fs = FileSystem.getFs({
                defaultAct: [bone.wrapper(function(buffer, encoding, callback) {
                        callback(null, buffer.toString() + '1');
                    }),
                    bone.wrapper(function(buffer, encoding, callback) {
                        callback(null, buffer.toString() + '2');
                    })
                ]
            });

            var avild = true;

            var stream = fs.createReadStream('~/src/js/hello.js');

            stream.on('data', function(trunk) {
                if (trunk.toString() != "alert('hello world!');12") {
                    avild = false;
                }
            });

            stream.on('end', function() {
                if (avild) {
                    done();
                } else {
                    done(false);
                }
            });
        });
    });

    describe('pathResolve', function() {
        it('separator only / characters are used! on windows characters \\ will be converted into / ', function() {
            if (os.platform().indexOf('win') == 0) {
                var result = bonefs.pathResolve('~\\test\\characters');

                if (result == bonefs.pathResolve(path.join(bonefs.base, '/test/characters'))) {
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

            if (resolveResult == bonefs.base) {
                assert.ok(true);
            } else {
                assert.ok(false);
            }
        });

        it('resolve ~folder to ~/folder', function() {
            var cresult = bonefs.pathResolve('~folder');
            var sresult = bonefs.pathResolve('~/folder');

            if (cresult == sresult) {
                assert.ok(true);
            } else {
                assert.ok(false);
            }
        });

        it('resolve / to absolute path', function() {
            var resolveResult = bonefs.pathResolve('/');

            if (resolveResult == bonefs.pathResolve(path.resolve('/'))) {
                assert.ok(true);
            } else {
                assert.ok(false);
            }
        });

        it('resolve . default to bone\'s base path', function() {
            var resolveResult = bonefs.pathResolve('.');

            if (resolveResult == bonefs.base) {
                assert.ok(true);
            } else {
                assert.ok(false);
            }
        });

        it('resolve . to relative some path', function() {
            var resolveResult = bonefs.pathResolve('./test', '/example');

            if (resolveResult == bonefs.pathResolve(path.resolve('/example/test'))) {
                assert.ok(true);
            } else {
                assert.ok(false);
            }
        });

        it('resolve "" default to bone\'s base path', function() {
            var resolveResult = bonefs.pathResolve('');

            if (resolveResult == bonefs.base) {
                assert.ok(true);
            } else {
                assert.ok(false);
            }
        });

        it('support resolve ~ dir path', function() {
            var resolveResult = bonefs.pathResolve('.', '~');

            if (resolveResult == bonefs.base) {
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
                var stream = bonefs.createWriteStream(file, {
                    focus: true
                });
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
                if (error) {
                    done();
                } else {
                    done(false);
                }
            });
        });

        it('read a empty file', function(done) {
            var content = fs.readFileSync(bonefs.pathResolve('~/src/empty/js.js'));
            bonefs.readFile('~/dist/empty/js.js', function(err, c) {
                if (content.toString() == c.toString()) {
                    done();
                } else {
                    done(false);
                }
            });
        });

        it('read a virtual file as same as real file', function(done) {
            var content = fs.readFileSync(bonefs.pathResolve('~/src/single/foo.js'));

            bonefs.readFile('~/dist//single/foo.js', function(err, result) {
                if (result.toString() == content.toString()) {
                    done();
                } else {
                    done(false);
                }
            });
        });

        it('read file with option that has act', function(done) {
            var act = bone.wrapper(function(buffer, encoding, callback) {
                var ctx = buffer.toString();

                ctx += '|test';

                callback(null, ctx);
            });

            bonefs.readFile('~/src/js/hello.js', {
                act: act
            }, function(err, buffer) {
                if (err) {
                    return done(false);
                }

                if (buffer.toString() != "alert('hello world!');|test") {
                    return done(false);
                }

                bonefs.readFile('~/src/js/hello.js', function(err, buffer) {
                    if (buffer.toString() == "alert('hello world!');") {
                        done();
                    } else {
                        done(false);
                    }
                });
            });
        });
    });

    describe('writeFile', function() {
        it('write file and create folder', function() {
            bonefs.rm('~/folder');
            bonefs.writeFile('~/folder/foo.js', 'test', {
                focus: true
            });

            if (fs.existsSync(bonefs.pathResolve('~/folder/foo.js'))) {
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

            if (_.intersection(vresult, rresult).length != rresult.length) {
                assert.ok(false);
            }
        });
    });

    describe('readDir', function() {
        it('read virtual folder', function() {
            var content = bonefs.readDir('~/dist/readDir');
            var vcontent = fs.readdirSync(bonefs.pathResolve('~/src/readDir'));

            if (_.intersection(content, vcontent).length != vcontent.length) {
                assert.ok(false);
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
                if (stat.isDirectory()) {
                    assert.ok(true);
                } else {
                    assert.ok(false);
                }
            } catch (e) {
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
            if (fs.existsSync(dir)) {
                assert.ok(false);
            } else {
                assert.ok(true);
            }
        });

        it('rm dir without project base will throw a error', function() {
            assert.throws(function() {
                bonefs.rm('/tmp');
            });
        });
    });

    describe('refresh', function() {
        it('to refresh glob match file(not exist before)', function() {
            var file = bonefs.pathResolve('~/src/glob/afterAdd.js');
            var vfile = bonefs.pathResolve('~/dist/glob/afterAdd.js');
            fs.writeFileSync(file, 'test');
            bonefs.refresh();
            var exist = bonefs.existFile(vfile);
            bonefs.rm(file);
            bonefs.refresh();
            if (exist) {
                assert.ok(true);
            } else {
                assert.ok(false);
            }
        });
    });
});

describe('bone.helper', function() {
    describe('autoRefresh', function() {
        it('run away', function() {
            assert.doesNotThrow(function() {
                bone.helper.autoRefresh(function(watcher) {
                    if (!watcher) {
                        throw new Error();
                    }
                });
                bone.helper.autoRefresh(function(watcher) {
                    if (!watcher) {
                        throw new Error();
                    }
                });
            });
        });

        it('change file will clean cache', function(done) {
            var cache = require('../lib/cache.js');
            var filePath = bonefs.pathResolve('~/dist/change/change.js');
            var sourcePath = bonefs.pathResolve('~/src/change/change.js');

            bone.helper.autoRefresh(function() {
                bone.status.watch = true;
                fs.writeFileSync(sourcePath, '1');
                bonefs.readFile(filePath, function(error, buffer) {
                    var cached = cache.get(filePath);

                    if (!cache.get(filePath)) {
                        return done(false);
                    }

                    fs.writeFileSync(sourcePath, 'change file');

                    setTimeout(function() {
                        if (cache.get(filePath)) {
                            return done(false);
                        }

                        done();
                        bone.status.watch = false;
                    }, 600);
                });
            });
        });

        it('add or delete file will clean cache and refresh file system', function(done) {
            var cache = require('../lib/cache.js');
            var addFile = bonefs.pathResolve('~/src/change/add.js');

            if (fs.existsSync(addFile)) {
                fs.unlinkSync(addFile);
            }

            bone.helper.autoRefresh(function() {
                bonefs.readFile('~/dist/change/change.js', function(error, buffer) {
                    var filePath = bonefs.pathResolve('~/dist/change/change.js');

                    if (!cache.get(filePath)) {
                        return done(false);
                    }
                    fs.writeFile(addFile, 'add file', function(err) {                        
                        if (err) {
                            return done(false);
                        }
                        setTimeout(function() {
                            var result = false;
                            if (!cache.get(filePath)) {
                                result = null;
                            }
                            fs.unlinkSync(addFile);

                            done(result);
                        }, 600);
                    });
                });
            });
        });

        it('delete file', function(done) {
            bone.helper.autoRefresh(function(watcher) {
                var addFile = bonefs.pathResolve('~/src/deleteFile/concat/temp.js');
                var Data = require('../lib/data.js');

                fs.writeFile(addFile, 'test', function() {
                    setTimeout(function() {
                        bone.utils.fs.dependentFile('~/dist/deleteFile/foo.js', function(err, dependenciesA) {
                            fs.unlink(addFile, function() {
                                setTimeout(function() {
                                    bone.utils.fs.dependentFile('~/dist/deleteFile/foo.js', function(err, dependenciesB) {
                                        var diff = _.difference(dependenciesA, dependenciesB);

                                        if (diff.length == 1 && diff[0] == addFile) {
                                            done();
                                        } else {
                                            done(false);
                                        }
                                    });
                                }, 400);
                            });
                        });
                    }, 400);
                });
            });
        });
    });
});