'use strict';
var bone = require('../index.js'),
	plugins = require('./plugin.js');

// define a virtual folder 'dist'
var dist = bone.dest('dist');
// copy src/**/* to dist/
dist.src('~/src/**/*');
// define a virtual folder 'dev' 
var dev = bone.dest('dev');

dev.dest('./')
	.src('~/src/js/*.js');

dev.dest('./')
	.src('~/src/css/css.css');

// define a virtual folder 'search' for test search()
var search = bone.dest('search');
search.src('~/src/**/*');