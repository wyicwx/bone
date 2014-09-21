'use strict';
var path = require('path'),
	resolve = require('resolve'),
	helper = require('./helper.js'),
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
// pack processor
bone.pack = helper.pack;

bone.fine = function() {

};

bone.project = function() {

};

module.exports = bone;
