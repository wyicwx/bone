'use strict';
var path = require('path'),
	resolve = require('resolve'),
	helper = require('./helper.js'),
	through2 = require('through2'),
	MixFileSystem = require('./MixFileSystem.js');

var bone = {};

// env
bone.env = {};
// version
bone.version = require('../package.json').version;
// start 
bone.setup = function(base) {
	if(this.setuped) return;

	this.fs = new MixFileSystem(base);
	this.setuped = true;
};
// define processor
bone.define = function() {

};

bone.project = function() {

};

bone.wrapper = helper.wrapper;

module.exports = bone;

