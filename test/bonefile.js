'use strict';
var bone = require('../index.js'),
	plugins = require('./plugin.js');

// define a virtual folder 'dist'
var dist = bone.dest('dist');
// copy src/**/* to dist/
dist.src('~/src/**/*');
// define single file
dist.dest('js')
	.src('~/src/js/hello.js')
	.rename('main.js');
// define a virtual folder 'dev' 
var dev = bone.dest('dev');
// copy ~/src/js/*.js to dev
dev.src('~/src/js/*.js');
// copy ~/src/css/css.css to dev/css.css
bone.dest('dev').src('~/src/css/css.css');



// define a virtual folder 'search' for test search()
var search = bone.dest('search');
search.src('~/src/**/*');

bone.project('dist', '~/dist/**/*');