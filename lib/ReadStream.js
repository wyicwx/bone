var _ = require('underscore');
var path = require('path');
var bone = require('./kernel.js');
var fs = require('fs');
var FileSystem = require('./fs.js');
var bonefs = FileSystem.fs;
var aggre = require('akostream').aggre;
var cache = require('./cache.js');
var Data = require('./data.js');

function _resolveDependentFile(self) {
	var option = self.option;
	if(!option.quote) {
		// 对引用过的文件，防止重复引用
		option.quote = {};
	}
	if(self.path in option.quote) {
		if(self.isVirtual) {
			bone.log.error('File over references:'+self.path);
			process.exit(-1);
		}
	} else {
		option.quote[self.path] = true;
	}
	self.trackStack.push(self.path);

	if(self.isVirtual) {
		var source = Data.virtualFiles[self.path].src;
		var acts = Data.virtualFiles[self.path].acts;
		var readStream = new ReadStream(source, option);
		self.originSource = readStream.originSource;
		self.trackStack = self.trackStack.concat(readStream.trackStack);
		if(option.acts) {
			acts = acts.concat(option.act);
		}
		self.sourceStream = function() {
			if(cache.cached(self.path)) {
				var origin = bone.utils.stream.origin(cache.get(self.path));
			} else {
				var origin = readStream.toStream();
				var fs = FileSystem.getFs({
					hostFilePath: self.path
				});

				_.each(acts, function(act) {
					var destStream = act();
					// fix issue https://github.com/wyicwx/bone/issues/2
					if(!destStream.runtime) {
						destStream = destStream();
					}
					if(!destStream.runtime) return;
					destStream.runtime.source = self.originSource;
					destStream.runtime.bone = bone;
					destStream.runtime.destination = self.path;
					destStream.runtime.fs = fs;
					origin = origin.pipe(destStream);
				});

				cache.set(self.path, origin);

				origin.on('end', function() {
					fs.hostDependencies.push(self.originSource);
					FileSystem.setTraceTree(self.path, _.uniq(fs.hostDependencies));
				});
			}


			return origin;
		};
	} else {
		self.originSource = self.path;
		self.sourceStream = function() {
			if(cache.cached(self.path)) {
				var stream = bone.utils.stream.origin(cache.get(self.path));
			} else {
				var stream = fs.createReadStream(self.path, {
					encoding: option.encoding
				});

				cache.set(self.path, stream);
			}

			return aggre(stream);
		};
	}
};

function ReadStream(file, option) {
	// 对真实文件的依赖
	this.dependentFile = null;
	// 文件完整路径
	this.path = file;
	// 文件夹
	this.dir = path.dirname(file);
	// 文件名
	this.basename = path.basename(file);
	// 是否虚拟文件
	this.isVirtual = bonefs.existFile(file, {notFs: true});
	// 依赖的真实文件, resolveDependentFile之后可以获取
	this.originSource = null;
	// 文件源流
	this.sourceStream = null;
	// 读取流参数
	this.option = option || {};
	// 依赖文件堆栈
	this.trackStack = [];
	// 解析文件链
	_resolveDependentFile(this);
}

ReadStream.prototype.toStream = function() {
	return this.sourceStream();
}

module.exports = ReadStream;