var aggre = require('akostream').aggre;
var Stream = require('stream');
var Data = require('./data.js');
var debug = bone.log.debug;

var cache = Data.fileCache;
exports.set = function(filePath, stream) {
    if(!bone.status.watch) {
        return false;
    }
    if(arguments.length < 2) {
        return false;
    }
    if(typeof filePath != 'string') {
        return false;
    }

    debug('set   : '+filePath);
    if(!cache[filePath]) {
        cache[filePath] = {
            status: 'init',
            buffer: null
        };
    }
    if(cache[filePath].status === 'set') {
        return false;
    }

    cache[filePath].status = 'set';
    if(stream instanceof Buffer) {
        if(cache[filePath].status === 'set') {
            cache[filePath].buffer = stream;
            cache[filePath].status = 'cached';
        }
    } else if(stream instanceof Stream) {
        aggre(stream).on('data', function(buffer) {
            if(cache[filePath].status === 'set') {
                bone.log.debug('set on data:'+filePath);
                cache[filePath].buffer = buffer;
                cache[filePath].status = 'cached';
            }
        }).on('end', function() {
            if(cache[filePath].status === 'set') {
                bone.log.debug('set on end:'+filePath);
                cache[filePath].buffer = new Buffer(0);
                cache[filePath].status = 'cached';
            }
        });
    } else {
        return false;
    }
    bone.utils.debug.showMem();

    return true;
};

exports.get = function(filePath) {
    if(!filePath) {
        return false;
    }
    if(!bone.status.watch) {
        return false;
    }
    if(cache[filePath] && cache[filePath].status === 'cached') {
        debug('get   : '+filePath);
        return cache[filePath].buffer;
    }
    return false;
};

exports.clean = function(filePath) {
    if(!bone.status.watch) {
        return false;
    }
    if(cache[filePath]) {
        debug('clean : '+filePath);
        cache[filePath].buffer = null;
        cache[filePath].status = 'clean';
        return true;
    }
    return false;
};

exports.cached = function(filePath) {
    if(!bone.status.watch) {
        return false;
    }
    if(cache[filePath] && cache[filePath].status === 'cached') {
        debug('cached: '+filePath);
        return true;
    }

    debug('not cached: '+filePath);
    return false;
};