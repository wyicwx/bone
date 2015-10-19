var _ = require('underscore');
var stream = require('akostream');
var async = require('async');

var utils = {};

utils.stream = stream;

utils.async = async;

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
}

module.exports = _.extend(utils, _);