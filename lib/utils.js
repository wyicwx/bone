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
	map2local: function(file, callback) {
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
				bone.log.info('bone-build', path.relative(cwd, file));
				callback();
			});
		} else {
			bone.log.info('bone-build', 'nothing for '+path.relative(cwd, file));
			callback();
		}
	},
	mapAll2local: function() {
		var FileSystem = require('./fs.js');
		var bone = require('./kernel.js');
		var fs = FileSystem.fs;
		var files = FileSystem.fileStack;

		var total = files.length;
		var build = function() {
			var file = files.shift();
			if(file) {
				/**
				 * 受操作系统的限制一次性打开太多文件会报错
				 * 修改成生成构建好一个再构建下一个
				 */
				utils.fs.dependentFile(file, function() {
					build();
				});
			} else {
				if(bone.log.warn.count > 0) {
					bone.log.info('bone-build', ('status: unknown, total: '+total+' file, warn: ('+bone.log.warn.count+')').yellow);
				} else {
					bone.log.info('bone-build', ('status: success, total: '+total+' file, warn: ('+bone.log.warn.count+')').green);
				}
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