'use strict';
var path = require('path'),
	resolve = require('resolve'),
	helper = require('./helper.js'),
	through2 = require('through2');

var bone = {};

// version
bone.version = require('../package.json').version;
// start 
bone.setup = function(base) {
	if(this.setuped) return;
	var FileSystem = require('./fs.js');
	var file = require('./file.js');

	this.fs = new FileSystem(base);
	this.setuped = true;
	file.setup();

	// var self = this;
	// setTimeout(function() {
	// 	console.log(self.fs);
	// });
};
// define processor
bone.define = function(path) {
	var File = require('./file.js').File;
	return new File(path);
};

bone.createReadStream = function(path) {
	return this.fs.getStream(path);
};

bone.project = function() {

};

bone.wrapper = helper.wrapper;

module.exports = bone;

