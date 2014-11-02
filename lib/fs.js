var path = require('path');
var minimatch = require('minimatch');
var _ = require('underscore');
var glob = require('glob');
var fs = require('fs');


// file path src 
function FileSystem(base) {
	this.base = base;
	this.files = {};
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

	return formatPath(result);
};

FileSystem.prototype.getStream = function(filePath) {
	filePath = this.pathResolve(filePath);
	var ReadStream = require('./ReadStream.js');
	var readStream = new ReadStream(filePath, {vfs: this});

	return readStream.toStream();
};

FileSystem.prototype.search = function(search) {
	search = this.pathResolve(search);

	var virtual = minimatch.match(_.keys(this.files), search, {});
	var real = glob.sync(search);

	var result = _.uniq(virtual.concat(real));

	return result;
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
	filePath = this.pathResolve(filePath);

	if(filePath in this.files) {
		return true;
	} else {
		if(!option.notFs) {
			return fs.existsSync(filePath);
		}
	}
	return false;
};

function formatPath(p) {
	return p.split(path.sep).join('/');
}

module.exports = FileSystem;