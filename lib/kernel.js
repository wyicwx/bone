'use strict';
var path = require('path'),
	fs = require('fs'),
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
	this.fs.searchStack();
};
// define dest
bone.dest = function(path) {
	var File = require('./file.js').File;
	return new File(path);
};

bone.createReadStream = function(file) {
	return this.fs.createReadStream(file);
};

// bone.writeReadStream = function(file) {
// 	var mkdirp = require('mkdirp');
// 	var dir = path.dirname(file);
// 	return through2(function(buffer, encoding, callback) {
// 		mkdirp(dir, function(err) {
// 			if(err) throw err;

// 		});
// 	});
// };

bone.project = function() {

};

bone.wrapper = helper.wrapper;

module.exports = bone;

