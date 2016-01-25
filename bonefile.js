var path = require('path');
var bone = require('bone');
var less = bone.require('bone-act-less');
var concat = bone.require('bone-act-concat');
var include = bone.require('bone-act-include');
var htmllayout = bone.require('bone-act-htmllayout');
var connect = require('bone-cli-connect');

var marked = require('marked');
marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});
var markdown = bone.wrapper(function(buffer, encoding, callback) {
    var md = buffer.toString();

    this.cacheable();

    callback(null, marked(md));
});


var dist = bone.dest('dist').cwd('~/src');

dist.dest('css')
    .src('~/src/assets/less/style.less')
    .act(less)
    .rename('style.css');

dist.src('./assets/?(fontawesome|fonts|bootstrap)/**/*');

bone.dest('docs')
    .cwd('~/src/docs')
    .src('./*.md')
        .act(markdown)
        .act(bone.wrapper(function(buffer, encoding, callback) {
            var result = [new Buffer('<layout src="../layouts/layout.html">'), buffer, new Buffer('</layout>')];

            this.cacheable();

            callback(null, Buffer.concat(result));
        }))
        .act(htmllayout({}, {
            filter: 'md'
        }))
        .rename(function(fileName, filePath, fileInfo) {
            return fileInfo.name+'.html';
        });

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