var path = require('path');
var bone = require('bone');
var less = bone.require('bone-act-less');
var concat = bone.require('bone-act-concat');
var include = bone.require('bone-act-include');
var connect = require('bone-cli-connect');


var dist = bone.dest('dist').cwd('~/src');

dist.dest('css')
    .src('~/src/assets/less/style.less')
    .act(less)
    .rename('style.css');

dist.src('./assets/?(fontawesome|bootstrap)/**/*');

// bone.dest('dist')
//     .src('~/src/**/!(*.html)')
//     .act(include)
//     .act(less({
//         ieCompat: false
//     }))
//     .rename(function(fileName) {
//         if (path.extname(fileName) == '.less') {
//             return fileName.replace(/\.less$/, '.css');
//         } else {
//             return fileName;
//         }
//     });

// bone.dest('')
// 	.src('~/src/*.html');


bone.cli(connect({
	base: '~/',
	livereload: true
}));

bone.cli(require('bone-cli-build')());