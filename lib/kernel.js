'use strict';
var path = require('path'),
	fs = require('fs'),
	helper = require('./helper.js'),
	through2 = require('through2'),
	pkg = require('../package.json'),
	File = require('./file.js');

var bone = {};
// bone状态
bone.status = {
	base: null,
	test: false,
	debug: false,
	watch: false
};
// support commander color
require('colors');

// version
bone.version = pkg.version;
// setup 
bone.setup = function(base) {
	if(this.setuped) return;
	this.setuped = true;

	bone.status.base = path.resolve(base);

	var FileSystem = require('./fs.js');
	var project = require('./project.js');

	FileSystem.refresh();
};
// define dest
bone.dest = function(path) {
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

module.exports = bone;

