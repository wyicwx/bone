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

	base = path.resolve(base);
	this.fs = new FileSystem(base);
	this.fs.refresh();
	this.setuped = true;
};
// define dest
bone.dest = function(path) {
	var File = require('./file.js');
	return new File(path);
};
// define project
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
// utils
bone.utils = require('./utils.js');

bone.log = require('./log.js');
// plugin wrapper
bone.wrapper = helper.wrapper;
// helper
bone.helper = helper;

module.exports = bone;

