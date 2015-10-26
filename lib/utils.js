var _ = require('underscore');
var stream = require('akostream');
var async = require('async');
var path = require('path');

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
	},
	dependentFile: function(file, callback) {
		var FileSystem = require('./fs.js');

		file = FileSystem.fs.pathResolve(file);
		if(FileSystem.traceTree[file]) {
			return callback(null, _.clone(FileSystem.traceTree[file]));
		} else {
			FileSystem.fs.readFile(file, function(error, buffer) {
				if(error) {
					callback(error, null);
				} else {
					callback(null, _.clone(FileSystem.traceTree[file]));
				}
			})
		}
	},
	getByDependentFile: function(file) {
		var FileSystem = require('./fs.js');

		file = FileSystem.fs.pathResolve(file);
		if(FileSystem.traceTreeB[file]) {
			return _.clone(FileSystem.traceTreeB[file]);
		}
	},
	map2local: function(file, callback, option) {
		option || (option = {});
		var FileSystem = require('./fs.js');
		var bone = require('./kernel.js');
		var fs = FileSystem.fs;

		file = fs.pathResolve(file);
		if(fs.existFile(file, {notFs: true})) {
			var readStream = fs.createReadStream(file);
			var writeStream = fs.createWriteStream(file, {focus: true});
			var cwd = process.cwd();

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
		var files = _.keys(FileSystem.files);

		var total = 0;

		var build = function() {
			var file = files.shift();

			if(file) {
				total++;
				/**
				 * 受操作系统的限制一次性打开太多文件会报错
				 * 修改成生成构建好一个再构建下一个
				 */
				try {
					utils.fs.map2local(file, function(e) {
						if(e) {
							callback(e);
						} else {
							build();
						}
					}, option);
				} catch(e) {
					return callback(e);
				}
			} else {
				if(!option.slient) {
					if(bone.log.warn.count > 0) {
						bone.log.info('bone-build', ('status: unknown, total: '+total+' file, warn: ('+bone.log.warn.count+')').yellow);
					} else {
						bone.log.info('bone-build', ('status: success, total: '+total+' file, warn: ('+bone.log.warn.count+')').green);
					}
				}
				callback(null, _.keys(FileSystem.files));
			}
		}
		build();
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