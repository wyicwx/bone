
return ;

bone.cd('/asfasdf/asdfasf')
	.file('index.js')
	.act(combine(['xxx', 'xxx', 'xxxx', 'xxx']))
	.act(jshint())
	.act()

bone.src('xxxx')
	.pipe(xxx)
	.pipe(combine(['../../../']))

bone.task

bone.src('./xxx/xxx/xxx')
	.act(xxx())
	.act(xxx())
	.dest('')

bone.define()
	.dir('test/')
	.dest('a.js')
	.src([
		'a.js',
		'b.js',
		'c.js',
		'e.js',
		'?????.js'
	])
	.act(include({
		arr: '$'
	}))
	.act(splithtml())
	.act(seajs());

bone.define()
	.dir('test/')
	.dest('c.js')
	.src([
		'a.js',
		'b.js',
		'c.js',
		'e.js'
	])
	.act(include({
		arr: '$'
	}))
	.act(splithtml())
	.act(seajs());

bone.define() // test/b.js
	.dir('test/')
	.dest('b.js')
	.src([
		'a.js',
		'b.js',
		'c.js',
		'e.js'
	])
	.act(include({
		arr: '$'
	}))
	.act(splithtml())
	.act(seajs());

bone.define()
	.dir('test/')
	.src([
		'a.js',
		'b.js',
		'c.js',
		'e.js'
	])
	.act(include({
		arr: '$'
	}))
	.act(splithtml())
	.act(seajs())
	// .dest()
	.rely()


var file = bone.define(function(source) {
	source.dir('src')
		.file([
			'x.js',
			'y.js'
		])
		.act(inlcude())
		.act(seajs())
});


var file2 = bone.define('test/xxx.js', function(source) {
	source.dir('src')
		.file(
			'x.html'
		)
		.act(inlcude())
		.act(seajs())
});


console.log(file2) //'test/xxx.js'

test/xxx.js

test/.bone.__asdf.js

bone.define()
	.dir('/test')
	.file()
	
connect();

bone.project('project')
	.file([
		'xxx',
		'yyy',
		file1
	]);

var include = require('bone-include');
var splithtml = require('bone-splithtml');

var taskpage = bone.wrapper(include(), splithtml());

var jslint = require('bone-jslint');

jtlint();

bone jslint -p project
bone jslint ./test/xxx.js

var connect = require('bone-connect');

connect();

bone connect();

bone build
bone jslint
bone connect


bone jslint 

bone ls
xxx_01230.js(*)

bone ls
xxx_12301.js(*)

bone build xxx_12301.js


bone build -act include,seajs,splithtml ./xxx.js > ./xxx_new.js
bone build ./xxx_new.js
bone build ./xxx_new_new.js


// xxx module
(function() {

bone.define('build/*', function(source) {
	source.dir('xxxx')
		.file('./*.html')
		.act(xxx())
		.act(yyy())
});

bone.define('build/*', function(source) {
	source.dir('xxxx')
		.file('./*.html')
		.act(xxx())
		.act(yyy())
});

bone.define('build/*', function(source) {
	source.dir('xxxx')
		.file('./*.html')
		.act(xxx())
		.act(yyy())
});

bone.define('build/*', function(source) {
	source.dir('xxxx')
		.file('./*.html')
		.act(xxx())
		.act(yyy())
});

bone.define('build/*', function(source) {
	source.dir('xxxx')
		.file('./*.html')
		.act(xxx())
		.act(yyy())
});


});


require('xxx');


bone.define('splithtml/*');f