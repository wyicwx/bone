var path = require('path');
var bone = require('bone');
var less = require('bone-less');
var connect = require('bone-connect');

var dist = bone.dest('dist');

// copy from src folder
dist.src('~/src/**/*');

// compile less to css
dist.dest('css')
	.src('~/src/less/*')
	.act(less)
	.rename(function(filename) {
		return path.basename(filename, '.less') + '.css';
	});


bone.cli(connect({
	base: '~/'
}))