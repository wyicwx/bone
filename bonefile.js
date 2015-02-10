var path = require('path');
var bone = require('bone');
var less = require('bone-less');
var concat = require('bone-concat');
var connect = require('bone-connect');

var dist = bone.dest('dist');

// copy from src folder
dist.src('~/src/**/*');

// compile less to css
dist.dest('css')
	.src('~/src/less/*')
	.act(concat({
		files: '~/src/sprite/icon.less'
	}))
	.act(less)
	.rename(function(filename) {
		return path.basename(filename, '.less') + '.css';
	});


bone.project('dist', '~/dist/**/*');

bone.cli(connect({
	base: '~/',
	livereload: true
}));

bone.task('sprite', {
	cli: require('bone-css-sprite'),
	params: {
		src: '~/src/icons/*.png',
		out: '~/src/images/',
		name: 'icon_sprite',
		style: '~/src/sprite/icon.less',
		processor: 'less',
		orientation: 'binary-tree'
	}
});

bone.task('release', {
	name: 'build',
	params: {
		p: 'dist'
	}
});