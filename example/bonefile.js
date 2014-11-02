var bone = require('bone');

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
	.src('./src/models/a.js')

filesDir.define('./dist/index.js')
	.src('./bonetmp/models/a.js');

// define combine file
// bone.define('~/bonetmp/vfile.js')
// 	.src('./abc.js')
// 	.act(combine([
// 		'~/a.js',
// 		'~/b.js'
	// ]));

// define combine file
// bone.define('~/bonetmp/vfile.js')
// 	.src(combine([
// 		'~/a.js',
// 		'~/b.js'
// 	]))

// bone.define('~/bonetmp')
// 	.src('~/src/*.js')
// 	.act(include())
// 	.act();

// bone.define('~/bonetmp')
// 	.src('~/src/**/*.less')
// 	.act(less());

// bone.define('~/bonetmp')
// 	.src('~/src/**/*.[png|jpg|gif|jpeg]')
// 	.act(base64())
// 	.rename(function(filename) {
// 		return filename.replace(/(png|jpg|gif|jpeg)$/, 'base64');
// 	});

var tmpDir = bone.define('~/bonetmp');

tmpDir.define('file.js')
	