var path = require('path');
var minimatch = require('minimatch');
var _ = require('underscore');
var glob = require('glob');
var fs = require('fs');
var aggre = require('akostream').aggre;
var mkdirp = require('mkdirp');

// file path src 
function FileSystem(base) {
	this.base = base;
	this.files = {};
	this.fileStack = [];
}

FileSystem.prototype.pathResolve = function(filepath, dir) {
	var first = filepath[0],
		result;

	if(dir) {
		dir = this.pathResolve(dir);
	} else {
		dir = this.base
	}

	// 相对于dir的相对路径
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

	result = result.split(path.sep).join('/');
	result = path.normalize(result);
	return result; // unix style
};

FileSystem.prototype.createReadStream = function(filePath, option) {
	option || (option = {});
	filePath = this.pathResolve(filePath);
	if(!this.existFile(filePath)) {
		throw new Error('file not exists: '+filePath);
	}
	var ReadStream = require('./ReadStream.js');
	var readStream = new ReadStream(filePath, {encoding: option.encoding});

	return readStream.toStream();
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

FileSystem.prototype.readFile = function(filePath, callback) {
	var buffer;
	aggre(this.createReadStream(filePath)).on('data', function(chunk) {
		buffer = chunk;
	}).on('end', function() {
		callback(null, buffer || new Buffer(0));
	});
};

FileSystem.prototype.search = function(search, option) {
	option || (option = {});
	search = this.pathResolve(search);
	var result = minimatch.match(this.fileStack, search, {});

	if(!option.notFs) {
		var real = glob.sync(search);

		result = _.uniq(result.concat(real));
	}

	return result;
};

FileSystem.prototype.searchStack = function() {
	var stack = {};
	var files = _.keys(this.files);
	_.each(files, function(file) {
		stack[file] = true;
		while(true) {
			var dir = path.dirname(file);
			if(stack[dir]) break;
			if(dir == '/') break;
			if(dir == this.base) break;
			stack[dir] = true;
			file = dir;
		}
	}, this);
	this.fileStack = _.keys(stack);
};

FileSystem.prototype.register = function(file, opt) {
	if(_.has(this.files, file)) {
		// warn
		throw new Error('Register override:'+file);
	}

	this.files[file] = _.extend(opt, {dest: file});
};

FileSystem.prototype.readDir = function(dirPath) {
	dirPath = this.pathResolve(dirPath);
	var result = this.search(path.join(dirPath, '*'));
	
	result = result.map(function(file) {
		return path.relative(dirPath, file);
	});
	return result;
};

FileSystem.prototype.existFile = function(filePath, option) {
	option || (option = {});

	filePath = this.pathResolve(filePath);
	
	if(filePath in this.files) {
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

module.exports = FileSystem;