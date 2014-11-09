var _ = require('underscore');
var path = require('path');
var bone = require('../index.js');
var fs = require('fs');
var vfs = bone.fs;

function _resolveDependentFile(self) {
	if(self.path in self.quote) {
		if(self.isVirtual) {
			throw new Error('File over references:'+self.path);
		}
	} else {
		self.quote[self.path] = true;
	}

	if(self.isVirtual) {
		var source = bone.fs.files[self.path].src;
		var acts = bone.fs.files[self.path].acts;
		var readStream = new ReadStream(source, {
			quote: self.quote
		});
		self.originSource = readStream.originSource;
		self.sourceStream = function() {
			var origin = readStream.toStream();

			_.each(acts, function(act) {
				var destStream = act();
				destStream.runtime.source = self.originSource;
				origin = origin.pipe(destStream);
			});

			return origin;
		};
	} else {
		self.originSource = self.path;
		self.sourceStream = function() {
			return fs.createReadStream(self.path);
		};
	}
};

// function _readProcessor(self) {
// 	var item = self.rawContent;
// 	var processor = item.processor || [];

// 	if(_.isString(processor)) {
// 		processor = processor.split(/\s*,\s*/);
// 	}

// 	var handlers = [];

// 	_.each(processor, function(key) {
// 		var processor = ReadStream.processor[value];
// 		if(processor) {
// 			handlers.push([ key, processor]);
// 		}
// 		return;
// 		// handlers.push([ key, 
// 		// 	ReadStream.processor[value] ? ReadStream.processor[value] : jt.require(value)
// 		// ]);
// 	});

// 	var result = [];
// 	// 文件合并处理
// 	if(item.merge == 'before') {

// 		_.each(self.readStreams, function(readStream) {
// 			self.combines.push(readStream.toStream());
// 		}, self);

// 		result.push(aggre(combines(self.combine)));

// 		_.each(processor, function(p) {
// 			var handler = p[1],
// 				name = p[0];

// 			result.push(handler(_.result(item, name) || {}, {
// 				dir: item.dir,
// 				filePath: options.file,
// 				ext: path.extname(options.file)
// 			}));
// 		}, self);
// 	} else { // 文件单独处理后再合并
// 		_.each(self.readStreams, function(readStream) {
// 			var o = origin(readStream.toStream());

// 			_.each(processor, function(p) {
// 				var handler = p[1],
// 					name = p[0];

// 				o = o.pipe(handler(_.result(options, name) || {}, {
// 					dir: options.dir,
// 					filePath: options.file,
// 					ext: path.extname(options.file)
// 				}));
// 			}, self);

// 			result.push(o);
// 		}, self);
// 	}

// 	return combine(result);
// };


function ReadStream(file, option) {
	// 对真实文件的依赖
	this.dependentFile = null;
	// 对引用过的文件，防止重复引用
	this.quote = option.quote || {};
	// 文件完整路径
	this.path = file;
	// 文件夹
	this.dir = path.dirname(file);
	// 文件名
	this.basename = path.basename(file);
	// 是否虚拟文件
	this.isVirtual = vfs.existFile(file, {notFs: true});
	// 依赖的真实文件, resolveDependentFile之后可以获取
	this.originSource = null;

	// 文件源流
	this.sourceStream = null;

	// this.combines = [];
	// this.readStreams = [];

	_resolveDependentFile(this);
	// _init(this);
}

ReadStream.prototype.toStream = function() {
	if(!this.isVirtual) {
		if(!fs.existsSync(this.path)) { // not exist.
			console.log('    [%s] File %s not exist.', 'warning'.yellow, this.path);
			return;
		}
	}

	return this.sourceStream();
}

module.exports = ReadStream;