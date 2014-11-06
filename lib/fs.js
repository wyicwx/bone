var path = require('path');
var minimatch = require('minimatch');
var _ = require('underscore');
var glob = require('glob');
var fs = require('fs');
var aggre = require('AKOStream').aggre;
var mkdirp = require('mkdirp');

// file path src 
function FileSystem(base) {
	this.base = path.normalize(base);
	this.files = {};
	this.fileStack = [];
}

FileSystem.prototype.pathResolve = function(filepath, dir) {
	var first = filepath[0],
		result;

	dir || (dir = this.base);

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
	return result; // 统一分割符为unix风格
};

FileSystem.prototype.createReadStream = function(filePath) {
	filePath = this.pathResolve(filePath);
	var ReadStream = require('./ReadStream.js');
	var readStream = new ReadStream(filePath, {vfs: this});

	return readStream.toStream();
};

FileSystem.prototype.createWriteStream = function(filePath) {
	filePath = this.pathResolve(filePath);
	var dir = path.dirname(filePath);
	mkdirp.sync(dir);
	return fs.createWriteStream(filePath);
};

FileSystem.prototype.readFile = function(filePath, callback) {
	aggre(this.createReadStream(filePath)).on('data', function(buffer) {
		callback(null, buffer);
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
		console.log('override:'+file);
	}

	this.files[file] = _.extend(opt, {dest: file});
};

FileSystem.prototype.exists = function(filePath, option) {
	option || (option = {});
	
	if(this.existsFile(filePath)) {
		return true;
	} else {
		if(!option.notFs) {
			filePath = this.pathResolve(filePath);
			return fs.existsSync(filePath);
		}
	}
	return false;
};

FileSystem.prototype.existsFile = function(filePath) {
	filePath = this.pathResolve(filePath);

	return filePath in this.files;
};

module.exports = FileSystem;