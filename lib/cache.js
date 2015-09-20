var bone = require('./kernel.js');
var aggre = require('akostream').aggre;
var Stream = require('stream');

var cache = {};

exports.set = function(filepath, stream) {
	if(!bone.status.watch) {
		return;
	}
	if(!cache[filepath]) {
		cache[filepath] = {
			status: null,
			buffer: null
		};
	}
	cache[filepath].status = 'set';
	if(stream instanceof Stream) {
		aggre(stream).on('data', function(buffer) {
			if(cache[filepath].status === 'set') {
				cache[filepath].buffer = buffer;
			}
		});
	}
};

exports.get = function(filepath) {
	if(!bone.status.watch) {
		return;
	}
	if(cache[filepath] && cache[filepath].buffer) {
		return cache[filepath].buffer;
	}
	return false;
};

exports.clean = function() {
	if(!bone.status.watch) {
		return;
	}
	if(cache[filepath]) {
		cache[filepath].buffer = null;
		cache[filepath].status = 'clean';
	}
}