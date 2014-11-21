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
// define over reference file
dist.dest('js')
   .src('./hello.js')
   .rename('a.js');
dist.dest('js')
   .src('./a.js')
   .rename('b.js');

// define a virtual folder 'dev' 
var dev = bone.dest('dev');
// copy ~/src/js/*.js to dev
dev.dest('js')
	.src('~/src/js/*.js');
// copy ~/src/css/css.css to dev/css.css
bone.dest('dev').src('~/src/css/css.css');
// define ~/dev/js/hello.js pass through author() processor
dev.dest('js')
   .src('./hello.js')
   .act(plugins.author({
   		author: 'wyicwx'
   }))
   .rename('hello_sign.js');
// define ~/dev/js/hello.js pass through author() and copyright() processor
dev.dest('js')
   .src('./hello.js')
   .act(plugins.author({
   		author: 'wyicwx'
   }))
   .act(plugins.copyright({
   		copyright: 'wyicwx'
   }))
   .rename('hello_sign_copyright.js');
// define ~/dev/js/hello.js pass through author-copyright() processor
dev.dest('js')
   .src('./hello.js')
   .act(plugins.authorCopyright({
   		author: 'wyicwx',
   		copyright: 'wyicwx'
   }))
   .rename('hello_sign-copyright.js');
// define ~/dev/js/hello.js pass through copyright() processor
dev.dest('js')
   .src('./hello.js')
   .act(plugins.copyright())
   .rename('hello_copyright_default.js');
// define ~/dev/js/hello.js pass through author-copyright-fixed-option() processor
dev.dest('js')
   .src('./hello.js')
   .act(plugins.authorCopyrightFixedOption())
   .rename('hello_sign-copyright-fixed-option.js');


// define a virtual folder 'search' for test search()
var search = bone.dest('search');
search.src('~/src/**/*');

bone.project('dist', '~/dist/**/*');