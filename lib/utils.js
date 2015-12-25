var _ = require('lodash');
var stream = require('akostream');
var path = require('path');
var Data = require('./data.js');

var utils = {};

utils.stream = stream;

utils.fs = {
    // track file stack
    track: function(file) {
        var FileSystem = require('./fs.js');
        var ReadStream = require('./ReadStream.js');

        if(FileSystem.fs.existFile(file)) {
            file = FileSystem.fs.pathResolve(file);
            var readStream = new ReadStream(file);

            return _.clone(readStream.trackStack);
        } else {
            return false;
        }
    },
    dependentFile: function(file, callback) {
        var FileSystem = require('./fs.js');

        file = FileSystem.fs.pathResolve(file);
        if(Data.virtualFileTraceTree[file]) {
            callback(null, _.clone(Data.virtualFileTraceTree[file]));
        } else {
            FileSystem.fs.readFile(file, function(error, buffer) {
                if(error) {
                    callback(error, null);
                } else {
                    callback(null, _.clone(Data.virtualFileTraceTree[file]));
                }
            });
        }
    },
    getByDependentFile: function(file) {
        var FileSystem = require('./fs.js');

        file = FileSystem.fs.pathResolve(file);
        return _.clone(Data.virtualFileTraceTreeB[file] || []);
    },
    map2local: function(file, callback, option) {
        option || (option = {});
        var FileSystem = require('./fs.js');
        var bone = require('./kernel.js');
        var fs = FileSystem.fs;
        var cwd = process.cwd();

        file = fs.pathResolve(file);
        if(fs.existFile(file, {notFs: true})) {
            try {
                var readStream = fs.createReadStream(file);
                var writeStream = fs.createWriteStream(file, {focus: true});
            } catch(e) {
                callback(e);
            }

            readStream.pipe(writeStream, {end: false});
            readStream.on('end', function() {
                if(!option.slient) {
                    bone.log.info('bone-build', path.relative(cwd, file));
                }
                callback();
            });
        } else {
            if(!option.slient) {
                bone.log.info('bone-build', 'nothing for '+path.relative(cwd, file));
            }
            callback();
        }
    },
    mapAll2local: function(callback, option) {
        option || (option = {});

        var FileSystem = require('./fs.js');
        var bone = require('./kernel.js');
        var fs = FileSystem.fs;
        var files = this.getAllVirtualFiles();

        var total = 0;

        var build = function() {
            var file = files.shift();

            if(file) {
                total++;
                /**
                 * 受操作系统的限制一次性打开太多文件会报错
                 * 修改成生成构建好一个再构建下一个
                 */
                utils.fs.map2local(file, function(e) {
                    if(e) {
                        callback(e);
                    } else {
                        build();
                    }
                }, option);
            } else {
                if(!option.slient) {
                    if(bone.log.warn.count > 0) {
                        bone.log.info('bone-build', ('status: unknown, total: '+total+' file, warn: ('+bone.log.warn.count+')').yellow);
                    } else {
                        bone.log.info('bone-build', ('status: success, total: '+total+' file, warn: ('+bone.log.warn.count+')').green);
                    }
                }
                callback(null, _.keys(Data.virtualFileTraceTree));
            }
        }
        build();
    },
    getAllVirtualFiles: function(options) {
        !options || (options = {});

        var files = _.keys(Data.virtualFiles);
        var tempFiles = _.clone(Data.virtualTemporaryFile);

        tempFiles.unshift(files);

        files = _.without.apply(_, tempFiles);

        return files;
    }
};

utils.debug = {
    showMem: function() {
        var bone = require('./kernel.js');
        if(!bone.status.debug) {
            return false;
        }
        var mem = process.memoryUsage();
        var format = function(bytes) {
          return (bytes/1024/1024).toFixed(2)+'MB';
        };
        bone.log.debug('Process: heapTotal '+format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));
        bone.log.debug('----------------------------------------');
    }
};

module.exports = _.extend(utils, _);