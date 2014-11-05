var bone = require('bone');
var combine = require('bone-combine');
var include = require('bone-include');
var connect = require('bone-connect');

var filesDir = bone.define('./files');
// define ~/bonetmp copy from ~/src
filesDir.define('./bonetmp')
	.src('./src/**/*.js')

filesDir.define('./bonetmp')
	.src('./src/**/*.js')
	.rename(function(name) {
		return '_tmp_'+name;
	});

filesDir.define('./bonetmp/abc.js')
	.src('./src/models/a.js');

filesDir.define('./dist/index.js')
	.src('./bonetmp/models/a.js');

// define combine file
bone.define('~/bonetmp/vfile.js')
	.src('./abc.js')
	.act(combine([
		'~/a.js',
		'~/b.js'
	]));
// (((abc)+a+b)+c+d) 
// define combine file
bone.define('~/bonetmp/vfile.js')
	.src('./abc.js')
	.act(combine([
		'~/a.js',
		'~/b.js'
	]))
	.act(combine([
		'~/c.js',
		'~/d.js'
	]));

bone.define('~/bonetmp')
	.src('~/src/*.js')
	.act(include())
	.act();

bone.define('~/bonetmp')
	.src('~/src/**/*.less')
	.act(less());

bone.define('~/bonetmp')
	.src('~/src/**/*.[png|jpg|gif|jpeg]')
	.act(base64())
	.rename(function(filename) {
		return filename.replace(/(png|jpg|gif|jpeg)$/, 'base64');
	});

var combineInlcude = bone.wrapper(combine(),
	include());

bone.define('~/bonetmp')
	.src('~/src/a.js')
	.act(combineInlcude());


connect(bone);
proxy(bone);
// var tmpDir = bone.define('~/bonetmp');

tmpDir.define('file.js')
	