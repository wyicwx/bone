'use strict';
var through = require('through2'),
    origin = require('akostream').origin,
    path = require('path'),
    _ = require('lodash'),
    Data = require('./data.js');

function wrapper(fn, defaultInfo) {
    defaultInfo || (defaultInfo = {});

    return function(option, info) {
        var scope = {
            option: option || {}
        };
        info || (info = {});
        scope.option.defaults = function(obj) {
            obj || (obj = {});
            return _.extend(obj, option);
        }
        return function() {
            var runScope = _.clone(scope);
            var stream = through(function(buffer, encoding, callback) {
                if(info.filter && !info.filter(runScope)) {
                    callback(null, buffer);
                } else {
                    var cb = function(err, data) {
                        // 防止内存泄漏
                        _.each(runScope, function(value, key) {
                            runScope[key] = null;
                        });
                        runScope = null;
                        callback(err, data);
                    };
                    runScope.argvs = {
                        buffer: buffer,
                        encoding: encoding,
                        callback: cb
                    };
                    fn.call(runScope, buffer, encoding, cb);
                }
            });
            stream.runtime = runScope;
            return stream;
        };
    };
}

exports.wrapper = wrapper;

var watcher;
function autoRefresh(callback) {
    var Gaze = require('gaze').Gaze;
    var cache = require('./cache.js');
    var bone = require('./kernel.js');
    var FileSystem = require('./fs.js');

    bone.status.watch = true;
    if(!watcher) {

        watcher = new Gaze('{!(node_modules)/**/*,!(node_modules)}', {
            src: bone.status.base,
            interval: 300
        }); 

        watcher.on('all', function(e, path, oldPath) {
            path = FileSystem.fs.pathResolve(path);
            if(oldPath) {
                oldPath = FileSystem.fs.pathResolve(oldPath);
            }
            cache.clean(path);
            switch(e) {
                case 'renamed':
                    path = oldPath;
                case 'deleted':
                    _.each(Data.virtualFileTraceTreeB[path], function(host) {
                        Data.virtualFileTraceTree[host] = _.without(Data.virtualFileTraceTree[host], path);
                    });
                    delete Data.virtualFileTraceTreeB[path];
                case 'added':
                    // add or delete event clean all virtual file cache
                    _.each(_.keys(Data.virtualFileTraceTree), function(p) {
                        cache.clean(p);
                    });

                    FileSystem.refresh();
                    bone.log.debug('clean all virtual cache.');
                break;
                case 'changed':
                    _.each(_.clone(Data.virtualFileTraceTreeB[path]), function(p) {
                        cache.clean(p);
                    });
            }
        });

        watcher.on('error', function(err) {
            throw err;
        });

        callback && callback(watcher);
    } else {
        callback && callback(watcher);
    }
}
exports.autoRefresh = autoRefresh;
exports.autoRefreshStop = function() {
    if(watcher) {
        watcher.close();
    }
};