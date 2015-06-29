'use strict';
var path = require('path'),
	fs = require('fs'),
	helper = require('./helper.js'),
	through2 = require('through2'),
	pkg = require('../package.json');

var bone = {};

// support commander color
require('colors');

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
bone.project = require('./project.js').project;

// utils
bone.utils = require('./utils.js');
// log
bone.log = require('./log.js');
// plugin wrapper
bone.wrapper = helper.wrapper;
// helper
bone.helper = helper;
// mode
bone.debug = false;

module.exports = bone;

