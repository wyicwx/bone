var bone = require('./kernel.js');
var aggre = require('akostream').aggre;
var Stream = require('stream');
var debug = bone.log.debug;

var cache = {};
exports.set = function(filepath, stream) {
	if(!bone.status.watch) {
		return false;
	}
	if(arguments.length < 2) {
		return false;
	}
	if(typeof filepath != 'string') {
		return false;
	}
	debug('set   : '+filepath);
	if(!cache[filepath]) {
		cache[filepath] = {
			status: 'init',
			buffer: null
		};
	}
	if(cache[filepath].status === 'set') {
		return false;
	}

	cache[filepath].status = 'set';
	if(stream instanceof Buffer) {
		if(cache[filepath].status === 'set') {
			cache[filepath].buffer = stream;
			cache[filepath].status = 'cached';
		}
	} else if(stream instanceof Stream) {
		aggre(stream).on('data', function(buffer) {
			if(cache[filepath].status === 'set') {
				cache[filepath].buffer = buffer;
				cache[filepath].status = 'cached';
			}
		});
	} else {
		return false;
	}
	bone.utils.debug.showMem();

	return true;
};

exports.get = function(filepath) {
	if(!filepath) {
		return false;
	}
	if(!bone.status.watch) {
		return false;
	}
	if(cache[filepath] && cache[filepath].status === 'cached') {
		debug('get   : '+filepath);
		return cache[filepath].buffer;
	}
	return false;
};

exports.clean = function(filepath) {
	if(!bone.status.watch) {
		return false;
	}
	if(cache[filepath]) {
		debug('clean : '+filepath);
		cache[filepath].buffer = null;
		cache[filepath].status = 'clean';
		return true;
	}
	return false;
}

exports.cached = function(filepath) {
	if(!bone.status.watch) {
		return false;
	}
	if(cache[filepath] && cache[filepath].status === 'cached') {
		debug('cached: '+filepath);
		return true;
	}

	debug('not cached: '+filepath);
	return false;
}