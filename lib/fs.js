var path = require('path');
var minimatch = require('minimatch');
var _ = require('lodash');
var glob = require('glob');
var fs = require('fs');
var aggre = require('akostream').aggre;
var mkdirp = require('mkdirp');
// var Project = require('./project.js');
var bone = require('./kernel.js');
var Data = require('./data');

// file path src 
function FileSystem(base, option) {
	option || (option = {});
	this.base = this.pathResolve(base);
	if(option.hostFilePath) {
		this.hostFile = option.hostFilePath;
		this.hostDependencies = [];
	}
}

FileSystem.prototype.pathResolve = function(filepath, dir) {
	var first = filepath[0],
		result;

	if(dir) {
		dir = this.pathResolve(dir);
	} else {
		dir = this.base
	}

	// relative 
	if(first == '.') {
		result = path.resolve(dir, filepath);
	} else if(first == path.sep) {
		result = path.resolve('/', filepath);
	} else if(first == '~') {
		filepath = filepath.replace(/^~+/, '');
		result = path.resolve(path.join(this.base, filepath));
	} else {
		result = path.resolve(dir, filepath);
	}

	result = path.normalize(result);
	result = result.split(path.sep).join('/');
	return result; // unix style
};

FileSystem.prototype.createReadStream = function(filePath, option) {
	option || (option = {});
	filePath = this.pathResolve(filePath);
	if(!this.existFile(filePath)) {
		throw new Error('file not exists: '+filePath);
	}

	if(this.hostFile) {
		this.hostDependencies.push(filePath);
	}

	var ReadStream = require('./ReadStream.js');
	var readStream = new ReadStream(filePath, {
		encoding: option.encoding,
		act: option.act
	});

	return readStream.toStream();
};

FileSystem.prototype.readFile = function(filePath, option, callback) {
	var buffer;
	var stream;

	if(!callback) {
		callback = option;
		option = null;
	}

	try {
		stream = this.createReadStream(filePath);
		aggre(stream).on('data', function(chunk) {
			buffer = chunk;
		}).on('end', function() {
			callback && callback(null, buffer || new Buffer(0));
		});
	} catch(e) {
		callback && callback(e);
	}
};

FileSystem.prototype.mkdir = function(dir) {
	dir = this.pathResolve(dir);
	mkdirp.sync(dir);
};

FileSystem.prototype.rm = function(dir) {
	dir = this.pathResolve(dir);
	if(fs.existsSync(dir)) {
		var stat = fs.statSync(dir);
		if(stat.isDirectory()) {
			var contain = fs.readdirSync(dir);
			_.each(contain, function(file) {
				this.rm(this.pathResolve(file, dir));
			}, this);
			fs.rmdirSync(dir);
		} else {
			fs.unlinkSync(dir);
		}
	}
};

FileSystem.prototype.createWriteStream = function(filePath, option) {
	option || (option = {});
	filePath = this.pathResolve(filePath);
	var dir = path.dirname(filePath);
	if(option.focus) {
		this.mkdir(dir);
	} else {
		if(!fs.existsSync(dir)) {
			throw new Error('fail to open '+dir);
		}
	}
	return fs.createWriteStream(filePath, option);
};

FileSystem.prototype.writeFile = function(filePath, content, option) {
	option || (option = {});
	filePath = this.pathResolve(filePath);
	var stream = this.createWriteStream(filePath, option);

	stream.write(content);
	stream.end();
};

FileSystem.prototype.search = function(search, option) {
	option || (option = {});
	search = this.pathResolve(search);
	var result = minimatch.match(Data.virtualFileStack, search, {});

	if(!option.notFs) {
		var real = glob.sync(search);

		result = result.concat(real);
	}
	var self = this;
	result = result.map(function(file) {
		return self.pathResolve(file);
	});
	result = _.uniq(result);
	return result;
};

FileSystem.prototype.refresh = function() {
	return FileSystem.refresh();
};

FileSystem.prototype.readDir = function(dirPath) {
	dirPath = this.pathResolve(dirPath);
	var result = this.search(path.join(dirPath, '*'));

	result = result.map(function(file) {
		return path.relative(dirPath, file).split(path.sep).join('/');
	});
	return result;
};

FileSystem.prototype.existFile = function(filePath, option) {
	option || (option = {});

	filePath = this.pathResolve(filePath);
	
	if(filePath in Data.virtualFiles) {
		return true;
	} else {
		if(!option.notFs) {
			filePath = this.pathResolve(filePath);
			if(fs.existsSync(filePath)) {
				var stat = fs.statSync(filePath);

				return stat.isFile();
			}
		}
	}
	return false;
};

/**
 * static
 */
Object.defineProperty(FileSystem, 'fs', {
	configurable: false,
	enumerable: true,
	get: function() {
		if(!this.value) {
			this.value = new FileSystem(bone.status.base);
		}
		return this.value;
	}
});

FileSystem.setTraceTree = function(file, dependencies) {
	var realDependencies = [];
	var raw = dependencies;

	while(raw.length) {
		var checkFile = raw.pop();
		if(Data.virtualFileTraceTree[checkFile]) {
			raw = raw.concat(Data.virtualFileTraceTree[checkFile]);
		} else {
			realDependencies.push(checkFile);
		}
	}

	realDependencies = _.uniq(realDependencies);
	// 计算移除的依赖文件
	// var reduce = [];
	// if(Data.virtualFileTraceTree[file]) {
	// 	_.each(Data.virtualFileTraceTree[file], function(f) {
	// 		console.log(f);
	// 		if(_.indexOf(realDependencies, f) == -1) {
	// 			reduce.push(f);
	// 		}
	// 	});
	// }
	Data.virtualFileTraceTree[file] = realDependencies;
	// 构建反向依赖树
	_.each(realDependencies, function(f) {
		if(!Data.virtualFileTraceTreeB[f]) {
			Data.virtualFileTraceTreeB[f] = [];
		}
		if(_.indexOf(Data.virtualFileTraceTreeB[f], file) == -1) {
			Data.virtualFileTraceTreeB[f].push(file);
		}
	});
	// 反向依赖树中移除文件依赖
	// if(reduce.length) {
	// 	_.each(reduce, function(f) {
	// 		Data.virtualFileTraceTreeB[f] = _.without(Data.virtualFileTraceTreeB[f], file);
	// 	});
	// }
};
FileSystem.register = function(file, options) {
	file = this.fs.pathResolve(file);
	if(_.has(Data.virtualFiles, file)) {
		// warn
		throw new Error('Register override:'+file);
	}
	Data.virtualFileStack.push(file);
	Data.virtualFiles[file] = _.extend(options, {dest: file});
	if(options.hide) {
		Data.virtualHideFile.push(file);
	}
};

FileSystem.refresh = function() {
	Data.virtualFiles = {};
	Data.virtualFileStack.length = 0;
	Data.virtualFileTraceTree = {};
	Data.virtualFileTraceTreeB = {};

	var File = require('./file.js');
	File.setup();
	this.searchStack();
};

FileSystem.searchStack = function() {
	var stack = {};
	var files = _.keys(Data.virtualFiles);
	_.each(files, function(file) {
		stack[file] = true;
		while(true) {
			var dir = path.dirname(file);
			if(stack[dir]) break;
			if(dir == '/') break;
			if(dir == bone.status.base) break;
			stack[dir] = true;
			file = dir;
		}
	}, this);
	Data.virtualFileStack = _.keys(stack);
};

FileSystem.getFs = function(option) {
	if(option) {
		return new FileSystem(bone.status.base, option);
	} else {
		return FileSystem.fs;
	}
};


module.exports = FileSystem;