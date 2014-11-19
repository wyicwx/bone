'use strict';
var path = require('path'),
	fs = require('fs'),
	helper = require('./helper.js'),
	through2 = require('through2'),
	pkg = require('../package.json');

// support commander color
require('colors');

var bone = {};

// version
bone.version = pkg.version;
// setup 
bone.setup = function(base) {
	if(this.setuped) return;
	var FileSystem = require('./fs.js');
	var project = require('./project.js');

	base = path.resolve(path.normalize(base));
	this.fs = new FileSystem(base);
	this.setuped = true;
	project.setup();
};
// define dest
bone.dest = function(path) {
	var File = require('./file.js');
	return new File(path);
};

bone.project = function(name, files) {
	if(name) {
		var project = require('./project.js');
		if(files) {
			var Project = project.Project;
			return new Project(name, files);
		} else {
			return project.get(name);
		}
	}
};

bone.wrapper = helper.wrapper;

module.exports = bone;

