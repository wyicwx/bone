var bone = require('../index.js');

// define ~/bonetmp copy from ~/src
bone.define('~/bonetmp')
	.src('~/src/*.js')

// define combine file
bone.define('~/bonetmp/vfile.js')
	.src(combine([
		'~/a.js',
		'~/b.js'
	]))

// define combine file
bone.define('~/bonetmp/vfile.js')
	.src(combine([
		'~/a.js',
		'~/b.js'
	]))

bone.define('~/bonetmp/')
	.src('~/src/*.js')
	.rename(function() {

	});

bone.define('~/')

bone.define('~/bonetmp')
	.src('~/src/*.js')
	.act(include())
	.act();

bone.define('~/bonetmp')
	.src('~/src/**/*.less')
	.act(less());

bone.define('~/bonetmp/base64')
	.src('~/src/**/*.png')
	.act(base64());

bone.define('~/')