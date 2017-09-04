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

    _.each(Data.virtualFiles, function(item) {
        var dir = path.dirname(item.src);

        watchedDirectorys[dir] = Date.now();
    });

    bone.status.watch = true;

    if(!watcher) {
        watcher = chokidar.watch(_.keys(watchedDirectorys), {
            cwd: bone.status.base,
            disableGlobbing: true,
            ignored: [/node_modules/g]
        });

        watcher.on('ready', function() {
            watcher.on('all', function(event, file, state) {
                if(watchPause) return;
                file = FileSystem.fs.pathResolve(file);
                let dir = path.dirname(file);

                if (event == 'add') {
                    if (watchedDirectorys[dir] && (Date.now() - watchedDirectorys[dir] < 1000)) {
                        return;
                    }
                }

                switch(event) {
                    case 'change':
                        event = 'changed';
                        watchEvent.emit('changed', file);
                    break;
                    case 'unlink':
                        event = 'deleted';
                        watchEvent.emit('deleted', file);
                    break;
                    case 'add':
                        event = 'added';
                        watchEvent.emit('added', file);
                    break;
                }

                watchEvent.emit('all', event, file);
            });
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
                    watchedDirectorys[dir] = Date.now();
                    Directory.push(dir);
                }
            });

            if (Directory.length) {
                watcher.add(Directory);
            }

        });
    }
}

var refreshFs = _.debounce(function(event, file) {
    bone.log.info(`'${file}' ${event}! refresh file system!`);
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

            refreshFs(event, path);
            bone.log.debug('clean all virtual cache.');
        break;
        case 'changed':
            _.each(_.clone(Data.virtualFileTraceTreeB[path]), function(p) {
                cache.clean(p);
            });
        break;
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