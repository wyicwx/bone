'use strict';
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var minimatch = require('minimatch');
var Log = require('./log.js');
var FileSystem = require('./fs.js');

function File(destination, option) {
	option || (option = {});
	this.parentPath = option.parent || ''; // raw path
	this.destination = destination;
	this.source = null;
	this.renameFn = null;
	this.cwdPath = option.cwd || '';
	this.acts = [];
	this.hide = false;
}

File.prototype.dest = function(p) {
	return new File(p, {
		parent: path.join(this.parentPath, this.destination)
	});
};

File.prototype.cwd = function(cwd) {
	if(this.source) {
		throw new Error('call cwd() after src()!');
	}
	var file = new File(this.destination, {
		parent: this.parentPath,
		cwd: cwd
	});

	return file;
};

File.prototype.src = function(src) {
	if(_.isArray(src)) {
		src.map(function(src) {
			if(!_.isString(src)) {
				throw new Error('src() only support string and array!');
			}
		});
	} else if(!_.isString(src)) {
		throw new Error('src() only support string and array!');
	}

	var file = new File(this.destination, {
		parent: this.parentPath,
		cwd: this.cwdPath
	});
	file.source = src;
	File.fileList.push(file);

	return file;
};

File.prototype.rename = function(fn) {
	if(!this.source) {
		throw new Error('call src() first!');
	}
	if(!fn) return;
	if(!_.isString(fn) && !_.isFunction(fn)) {
		this.destroy();
		throw new Error('rename() only support string or function!');
	}

	this.renameFn = fn;

	return this;
};

File.prototype.act = function(fn) {
	if(!this.source) {
		throw new Error('call src() first!');
	}
	this.acts.push(fn);
	return this;
};

File.prototype.destroy = function() {
	if(!this.source) {
		throw new Error('call src() first!');
	}
	File.fileList = _.without(File.fileList, this);
};
/**
 * hide in virtual system
 * @param  {Boolean} isHide 
 */
File.prototype.hide = function(isHide) {
	if(!this.source) {
		throw new Error('call src() first!');
	}

	this.hide = isHide;

	return this;
};

File.fileList = [];
	
File.setup = function(file) {
	var bonefs = require('./fs.js').fs;
	var pathResolve = function() {
		return bonefs.pathResolve.apply(bonefs, arguments);
	}

	if(!file) {
		file = this.fileList;
	}

	if(_.isArray(file)) {
		return file.map(File.setup);
	}

	file.parentPath = pathResolve(file.parentPath);
	file.destPath = pathResolve(file.destination, file.parentPath);
	file.source = _.isArray(file.source) ? file.source : [file.source];

	_.each(file.source, function(src) {
		new FileFormat(src, file);
	});
};

function FileFormat(src, file) {
	// the File instance 
	this.file = file;
	this.src = src;
	// the source file array
	this.source = null;
	// current 
	this.cwd = '';
	// is glob syntax
	this.isGlobSyntax = false;

	this.initialize();
}

FileFormat.prototype.initialize = function() {
	var file = this.file;

	if(file.cwdPath) {
		this.source = this.pathResolve(this.src, file.cwdPath);
	} else {
		this.source = this.pathResolve(this.src, file.destPath);
	}
	var globSearchPath = this.getSearchPath();

	if(globSearchPath != this.source) {
		this.isGlobSyntax = true;
		if(file.cwdPath && globSearchPath.indexOf(file.cwdPath) != -1) {
			this.cwd = file.cwdPath;
		} else {
			this.cwd = globSearchPath;
		}
	} else if(file.cwdPath) {
		this.cwd = this.pathResolve(file.cwdPath);
	}

	if(this.isGlobSyntax) {
		this.glob();
	} else {
		this.register();
	}
};

FileFormat.prototype.glob = function() {
	var bonefs = require('./fs.js').fs;
	var result = bonefs.search(this.source);

	if(result.length) {
		_.each(result, function(source) {
			source = this.pathResolve(source);
			// it's be supported what virtual file
			if(!bonefs.existFile(source, {notFs: true})) {
				// filter folder
				var stat = fs.statSync(source);
				if(!stat.isFile()) return;
			}
			this.register(source);
		}, this);
	} else {
		// warn
		Log.warn('Not exists: '+this.source);
	}
};

FileFormat.prototype.register = function(source) {
	var bonefs = FileSystem.fs;
	if(!this.isGlobSyntax) {
		source = this.source;
		if(!bonefs.existFile(source)) {
			Log.warn('Not exists: '+source);
			return;
		}
	}
	
	var dest, destPath = this.file.destPath;
	if(this.cwd) {
		dest = source.replace(this.cwd, destPath);
	} else {
		dest = path.join(destPath, path.basename(source));
	}

	dest = this.rename(source, dest);
	FileSystem.register(dest, {
		src: source,
		acts: _.clone(this.file.acts)
	});
};

FileFormat.prototype.pathResolve = function() {
	var bonefs = require('./fs.js').fs;
	return bonefs.pathResolve.apply(bonefs, arguments);
}

FileFormat.prototype.getSearchPath = function() {
	var mmatch = minimatch.Minimatch(this.source);
	var result = [];
	var matchArray = mmatch.set[0];

	for(var i = 0, length = matchArray.length; i < length; i++) {
		if(_.isString(matchArray[i])) {
			result.push(matchArray[i]);
		} else {
			break;
		}
	}

	return this.pathResolve(result.join('/'));
};

FileFormat.prototype.rename = function(source, dest) {
	var file = this.file;
	if(file.renameFn) {
		var filename = path.basename(source);
		if(_.isFunction(file.renameFn)) {
			filename = file.renameFn.call(null, filename, source);
		} else if(_.isString(file.renameFn)) {
			filename = file.renameFn;
		}
		dest = path.join(path.dirname(dest), filename);
	}

	return dest;
};

module.exports = File;