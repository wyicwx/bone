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
    var chokidar = require('chokidar');
    var watchedDirectorys = {};

    bone.status.watch = true;

    if(!watcher) {
        watcher = new chokidar.FSWatcher({
            cwd: bone.status.base
        });

        watcher.on('all', function(event, path, state) {
            if(watchPause) return;

            path = FileSystem.fs.pathResolve(path);

            switch(event) {
                case 'change':
                    event = 'changed';
                    watchEvent.emit('changed', path);
                break;
                case 'unlink':
                    event = 'deleted';
                    watchEvent.emit('deleted', path);
                break;
                case 'add':
                    event = 'added';
                    watchEvent.emit('added', path);
                break;
            }

            watchEvent.emit('all', event, path);
        });

        watcher.on('error', function(error) {
            throw error;
        });


        FileSystem.event.on('setTraceTree', function(file) {
            var realFiles = Data.virtualFileTraceTree[file];
            var Directory = [];

            _.each(realFiles, function(file) {
                var dir = path.dirname(file);

                if (!watchedDirectorys[dir]) {
                    watchedDirectorys[dir] = true;
                    Directory.push(dir);
                }
            });

            if (Directory.length) {
                watcher.add(Directory);
            }
        });
    }
}

var refreshFs = _.throttle(function() {
    FileSystem.refresh();
}, 1000);

watchEvent.on('all', function(event, path) {
    path = FileSystem.fs.pathResolve(path);
    cache.clean(path);


    switch(event) {
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

            refreshFs();
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