'use strict';
var through = require('through2'),
    origin = require('akostream').origin,
    path = require('path'),
    _ = require('lodash'),
    Data = require('./data.js'),
    cache = require('./cache.js'),
    FileSystem = require('./fs.js');

var watcher;
var watchEvent = new (require('events').EventEmitter)();
var watchPause = false;

function startWatch() {
    var Gaze = require('gaze').Gaze;

    bone.status.watch = true;

    if(!watcher) {
        watcher = new Gaze('{!(node_modules)/**/*,!(node_modules)}', {
            src: bone.status.base,
            interval: 300
        }); 

        watcher.on('all', function(error, path, oldPath) {
            if(watchPause) return;

            switch(error) {
                case 'renamed':
                case 'deleted':
                case 'added':
                case 'changed':
                    watchEvent.emit(error, path, oldPath);
                    watchEvent.emit('all', error, path, oldPath);
                break;
            }
        });

        watcher.on('error', function(error) {
            throw error;
        });
    }
}

watchEvent.on('all', function(error, path, oldPath) {
    path = FileSystem.fs.pathResolve(path);
    if(oldPath) {
        oldPath = FileSystem.fs.pathResolve(oldPath);
    }
    cache.clean(path);
    switch(error) {
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

module.exports = function() {
    startWatch();

    return watchEvent;
};

module.exports.pause = function() {
    watchPause = true;

    return watchEvent;
};

module.exports.resume = function() {
    watchPause = false;

    return watchEvent;
};