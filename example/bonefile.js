var bone = require('../index.js');
var plugins = require('./plugins.js');
// virtual folder 'dist'
var distDir = bone.dest('dist');
// virtual folder 'dist/vendor'
var vendor = distDir.dest('vendor');

vendor.dest('base-jquery-underscore-backbone-backbone.localStorage.js')
	.src('~/src/bower_components/todomvc-common/base.js')
	.act(plugins.concat([
		'~/src/bower_components/jquery/jquery.js',
		'~/src/bower_components/underscore/underscore.js',
		'~/src/bower_components/backbone/backbone.js',
		'~/src/bower_components/backbone.localStorage/backbone.localStorage.js'
	]));

// virtual folder assets
var assets = distDir.dest('assets');

assets.dest('/')
	.src('~/src/bower_components/todomvc-common/*!(.js)');

bone.project('release', '~/dist/**/*');