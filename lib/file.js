'use strict';
var filelist = [];
var path = require('path');
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

	filelist.push(this);
}

File.prototype.dest = function(p) {
	return new File(p, {
		parent: path.join(this.parentPath, this.destination)
	});
};

File.prototype.src = function(src) {
	this.source = src;

	return this;
};

File.prototype.rename = function(fn) {
	if(_.isFunction(fn)) {
		this.renameFn = fn;
	} else {
		// warn
	}
	return this;
};

File.prototype.act = function(fn) {
	this.acts.push(fn);
	return this;
};

function setupFile(file) {
	var _getSearchPath = function(p) {
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

	if(_.isArray(file)) {
		return file.map(setupFile);
	}

	if(file.source) {
		file.parentPath = bone.fs.pathResolve(file.parentPath);
		var fullSourcePath = bone.fs.pathResolve(file.source, file.parentPath);
		var searchPath = _getSearchPath(fullSourcePath);
		var isBatch = searchPath != fullSourcePath;
		var fullDestPath = bone.fs.pathResolve(file.destination, file.parentPath);

		if(isBatch) {
			var result = bone.fs.search(fullSourcePath);
			if(result.length) {			
				_.each(result, function(source) {
					// reset dest dir
					var dest = source.replace(searchPath, fullDestPath);
					// rename dest
					if(file.renameFn) {
						var filename = path.basename(source);
						filename = file.renameFn.call(null, filename);
						dest = path.join(path.dirname(dest), filename);
					}
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
				bone.fs.register(fullDestPath, {
					src: fullSourcePath,
					acts: file.acts,
					destPath: file.parentPath || path.dirname(dest)
				});
			}
		}
	}
}

module.exports = {
	File: File,
	setuped: false,
	setup: function() {
		if(!this.setuped) {
			setupFile(filelist);
			this.setuped = true;
		}
	}
}