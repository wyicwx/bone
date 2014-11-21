'use strict';
var filelist = [];
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var minimatch = require('minimatch');
var bone = require('../index.js');

function File(destination, option) {
	option || (option = {});
	this.parentPath = option.parent || ''; // raw path
	this.destination = destination;
	this.source = null;
	this.renameFn = null;
	this.acts = [];
}

File.prototype.dest = function(p) {
	return new File(p, {
		parent: path.join(this.parentPath, this.destination)
	});
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

	var file = new File(this.destination, {parent: this.parentPath});
	file.source = src;
	filelist.push(file);

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
	filelist = _.without(filelist, this);
};

File.setup = function(file) {
	file || (file = filelist);

	if(_.isArray(file)) {

		return file.map(File.setup);
	}

	file.parentPath = bone.fs.pathResolve(file.parentPath);
	var srcs = _.isArray(file.source) ? file.source : [file.source];

	_.each(srcs, function(src) {
		var fullDestPath = bone.fs.pathResolve(file.destination, file.parentPath);
		var fullSourcePath = bone.fs.pathResolve(src, fullDestPath);
		var searchPath = getSearchPath(fullSourcePath);
		var isBatch = searchPath != fullSourcePath;
		var dest = path.join(fullDestPath, path.basename(fullSourcePath));

		if(isBatch) {
			var result = bone.fs.search(fullSourcePath);
			if(result.length) {
				_.each(result, function(source) {
					var stat = fs.statSync(source);
					if(!stat.isFile()) return;
					// reset dest dir
					var dest = source.replace(searchPath, fullDestPath);
					dest = rename(source, dest, file);

					bone.fs.register(dest, {
						src: source,
						acts: _.clone(file.acts),
						destPath: file.parentPath || path.dirname(dest)
					});
				});
			} else {
				// warn
				console.log('not exists:'+fullSourcePath);
			}
		} else {
			if(!bone.fs.existFile(fullSourcePath)) {
				// warn
				console.log('not exists:'+fullSourcePath);
			} else {
				var dest = path.join(fullDestPath, path.basename(fullSourcePath));
				dest = rename(fullSourcePath, dest, file);
				bone.fs.register(dest, {
					src: fullSourcePath,
					acts: file.acts,
					destPath: file.parentPath || path.dirname(dest)
				});
			}
		}
	});
};

// resolve search clear path
function getSearchPath(p) {
	var mmatch = minimatch.Minimatch(p);
	var result = [];
	var matchArray = mmatch.set[0];

	for(var i = 0, length = matchArray.length; i < length; i++) {
		if(_.isString(matchArray[i])) {
			result.push(matchArray[i]);
		} else {
			break;
		}
	}

	return result.join('/');
}
// rename file
function rename(source, dest, file) {
	// rename dest
	if(file.renameFn) {
		var filename = path.basename(source);
		if(_.isFunction(file.renameFn)) {
			filename = file.renameFn.call(null, filename);
		} else if(_.isString(file.renameFn)) {
			filename = file.renameFn;
		}
		dest = path.join(path.dirname(dest), filename);
	}

	return dest;
}

module.exports = File;