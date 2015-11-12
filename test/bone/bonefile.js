'use strict';
var AKOStream = require('akostream');
var combine = AKOStream.combine;
var aggre = AKOStream.aggre;
var bone = require('../../index.js');
var plugins = {
	author: bone.wrapper(function(buffer, encoding, callback) {
		var option = this.option;
		var author = ['/**', ' * @author ' + (option.author || 'anonymous'), ' */', ''];

		author = new Buffer(author.join('\n'));

		callback(null, Buffer.concat([author, buffer]));
	}),
	copyright: bone.wrapper(function(buffer, encoding, callback) {
		var option = this.option.defaults({
			copyright: 'anonymous'
		});

		var copyright = ['/**', ' * @copyright ' + option.copyright, ' */', ''];

		copyright = new Buffer(copyright.join('\n'));

		callback(null, Buffer.concat([copyright, buffer]));
	}),
	concat: bone.wrapper(function(buffer, encoding, callback) {
		var option = this.option;
		var files = option.files || [];
		var destPath = this.destPath;
		var fs = this.fs;

		if (!Array.isArray(files)) {
			files = [files];
		}
		var streams = [];
		files.forEach(function(file) {
			file = fs.pathResolve(file, destPath);
			fs.search(file).forEach(function(f) {
				streams.push(aggre(fs.createReadStream(f)));
			});
		});
		var chunks = [buffer]

		combine(streams).on('data', function(chunk) {
			chunks.push(chunk);
		}).on('end', function() {
			callback(null, Buffer.concat(chunks));
		});
	})
};

plugins.authorCopyright = bone.wrapper(plugins.author, plugins.copyright),
plugins.authorCopyrightFixedOption = bone.wrapper(plugins.author({
	author: 'wyicwx'
}), plugins.copyright({
	copyright: 'wyicwx'
}));

// define a virtual folder 'dist'
var dist = bone.dest('dist');
// copy src/**/* to dist/
dist.src('~/src/**/*');
// 
dist.src('~/src/**/*')
	.rename(function(filename) {
		return 'rename-' + filename;
	});
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

// copy dist
var cdist = bone.dest('cdist');
cdist.src('~/dist/**/*');

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

dev.dest('js')
	.src('./hello.js')
	.act(plugins.authorCopyright)
	.rename('hello_sign-noparam.js');

dev.dest('track')
	.src('~/dev/js/*');

dev.dest('trackRename')
	.src('../track/hello.js')
	.rename('foo.js');

dev.dest('dependentFile')
	.src('~/dev/js/hello.js')
	.act(plugins.concat({
		files: [
			'~/src/project/file1.js',
			'~/dev/css.css'
		]
	}));

dev.dest('dependentFile')
	.src('~/dev/js/hello.js')
	.act(plugins.concat({
		files: [
			'~/src/project/file2.js',
			'~/src/project/file3.js',
			'~/dev/css.css'
		]
	}))
	.rename('foo.js');

dev.dest('change')
	.src('~/src/js/change.js');

dev.dest('change')
	.src('~/src/js/added.js');

bone.dest('cwd/all')
	.cwd('~/src')
	.src('./**/*');

bone.dest('cwd/js')
	.cwd('~/src')
	.src('./js/**/*');

bone.dest('cwd/folder')
	.cwd('~/src')
	.src('js/hello.js');

// define a virtual folder 'search' for test search()
bone.dest('search')
	.src('~/src/**/*');

// over reference
bone.dest('overReferences')
	.src('./bar.js');

bone.dest('notExist')
	.src('./*/notExist.js');

