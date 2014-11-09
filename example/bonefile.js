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

		

// 资源文件夹
// var projectDir = distDir.dest(pkg.name);

// projectDir.dest('common')
// 	.src('~/src/common/*.js')

// projectDir.dest('img')
// 	.src('~/src/img/*.png');

// projectDir.dest('data')
// 	.src('~/src/data/*.js');

// projectDir.dest('css')
// 	.src('~/src/less/*.less')
// 	.act(less())
// 	.rename(function(file) {
// 		return file.replace(/\.less$/, '.css');
// 	});

// projectDir.dest('mods')
// 	.src('~/src/mods/*.js')
// 	.act(transport({
// 		paths : ['sea-modules'],
//         idleading : pkg.name+'/',
//         cwd: '~/src',
//         alias : {
//           'lib/cmd-zepto' : 'lib/cmd-zepto',
//           'lib/cmd-underscore' : 'lib/cmd-underscore',
//           'lib/cmd-backbone' : 'lib/cmd-backbone',
//           'lib/cmd-mustache' : 'lib/cmd-mustache'
//         }
// 	}));

// projectDir.dest('main.js')
// 	.src('~/src/main.js')
// 	.act(concat({
// 		files: './mods/*.js'
// 	}));

// projectDir.dest('tpl')
// 	.src('~/src/tpl/**/*.tpl')
// 	.act(htmlminify())
// 	.act(transport({
// 		paths : ['sea-modules'],
//         idleading : pkg.name+'/',
//         cwd: '~/src',
//         alias : {
//           'lib/cmd-zepto' : 'lib/cmd-zepto',
//           'lib/cmd-underscore' : 'lib/cmd-underscore',
//           'lib/cmd-backbone' : 'lib/cmd-backbone',
//           'lib/cmd-mustache' : 'lib/cmd-mustache'
//         }
// 	}))
// 	.rename(function(file) {
// 		return file+'.js';
// 	});

// // 临时文件夹
// var tmpDir = bone.dest('bonetmp');

// // 定义project
// bone.project('dist', './dist/**/*.js');

// var connect = require('bone-connect');
// connect(bone)({
// 	base: './dist'
// });
// var build = require('bone-build');
// build(bone);