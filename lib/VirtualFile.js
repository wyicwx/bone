
// processor 
// 	// value    (没有依赖)
// 	// file     (有依赖)
// file string  (有依赖) 


function _init(self) {
	_setup(self);
	_resolveDependentFile(self);
}

function _setup(self) {
	if(_.isString(self.rawContent)) { // file string
		self.type = VirtualFile.TYPE_FILE;

		self.path = self.rawContent;
		self.dir = path.dirname(self.rawContent);
		self.basename = path.basename(self.rawContent);
		self.isVirtual = self.vfs.hasFile(self.path);
		self.quoted = self.path in self.quote;

		self.rawContent = self.vfs.resolveFile(self.path, {dir: self.dir});
	} else { // processor
		self.type = VirtualFile.TYPE_PROCESS;
	}
};

function _resolveDependentFile(self) {
	var files = [];
	if(self.type == VirtualFile.TYPE_FILE) {
		files = self.rawContent;
	} else {
		files = self.rawContent.file;
	}

	if(self.quoted) {
		if(self.isVirtual) {
			// over references.
			console.log('    [%s] File %s over references.', 'warning'.yellow, self.path);
		}
		self.dependentFile.push(self.path);
		return;
	} else {
		self.quote[self.path] = true;
	}

	_.each(files, function(file) {
		var readStream = new VirtualFile(file, {
			quote: self.quote,
			vfs: self.vfs
		});

		self.readStreams.push(readStream);

		// 依赖收集
		if(!readStream.isVirtual) {
			self.dependentFile.push(readStream.path);
		} else {
			self.dependentFile = self.dependentFile.concat(readStream.dependentFile);
		}
	}, self);

	self.dependentFile = _.uniq(self.dependentFile);
};

function _readFile(self) {
	if(!self.isVirtual) {
		if(!fs.existsSync(self.path)) { // not exist.
			console.log('    [%s] File %s not exist.', 'warning'.yellow, self.path);
		} else {
			self.combines.push(fs.createReadStream(self.path));
		}
	} else {
		_.each(self.readStreams, function(readStream) {
			self.combines.push(readStream.toStream());
		}, self);
	}
};

function _readProcessor(self) {
	var item = self.rawContent;
	var processor = item.processor || [];

	if(_.isString(processor)) {
		processor = processor.split(/\s*,\s*/);
	}

	var handlers = [];

	_.each(processor, function(key) {
		var processor = ReadStream.processor[value];
		if(processor) {
			handlers.push([ key, processor]);
		}
		return;
		// handlers.push([ key, 
		// 	ReadStream.processor[value] ? ReadStream.processor[value] : jt.require(value)
		// ]);
	});

	var result = [];
	// 文件合并处理
	if(item.merge == 'before') {

		_.each(self.readStreams, function(readStream) {
			self.combines.push(readStream.toStream());
		}, self);

		result.push(aggre(combines(self.combine)));

		_.each(processor, function(p) {
			var handler = p[1],
				name = p[0];

			result.push(handler(_.result(item, name) || {}, {
				dir: item.dir,
				filePath: options.file,
				ext: path.extname(options.file)
			}));
		}, self);
	} else { // 文件单独处理后再合并
		_.each(self.readStreams, function(readStream) {
			var o = origin(readStream.toStream());

			_.each(processor, function(p) {
				var handler = p[1],
					name = p[0];

				o = o.pipe(handler(_.result(options, name) || {}, {
					dir: options.dir,
					filePath: options.file,
					ext: path.extname(options.file)
				}));
			}, self);

			result.push(o);
		}, self);
	}

	return combine(result);
};

// 只读取单个
function VirtualFile(filecontent, option) {
	this.vfs = option.vfs;
	
	// 保存对真实文件的依赖
	this.dependentFile = [];
	// 对引用过的文件，防止重复引用
	this.quote = option.quote || {};
	// 原生数据
	this.rawContent = filecontent;

	// 记录类型  processor or file string
	this.type;
	
	// file type 所有字段
	// 文件夹
	this.dir = null;
	// 文件名
	this.basename = null;
	// 文件完整路径
	this.path = null;	
	// 是否虚拟文件
	this.isVirtual = false;
	// 是否被引用过
	this.quoted = false;

	this.combines = [];
	this.readStreams = [];

	_init(this);
}

VirtualFile.prototype.toStream = function() {
	if(this.type == VirtualFile.TYPE_FILE) {
		_readFile(this);
	} else {
		_readProcessor(this);
	}

	return combine(this.combines);
}

VirtualFile.TYPE_PROCESS = 1;
VirtualFile.TYPE_FILE = 0;