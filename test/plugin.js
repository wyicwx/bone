var bone = require('../index.js');
var AKOStream = require('akostream');
var combine = AKOStream.combine;
var aggre = AKOStream.aggre;

exports.author = bone.wrapper(function(buffer, encoding, callback) {
	var option = this.option;
	var author = ['/**', ' * @author '+(option.author||'anonymous'),' */', ''];

	author = new Buffer(author.join('\n'));

	callback(null, Buffer.concat([author, buffer]));
});

exports.copyright = bone.wrapper(function(buffer, encoding, callback) {
	var option = this.option.defaults({
		copyright: 'anonymous'
	});
	var copyright = ['/**', ' * @copyright '+option.copyright,' */', ''];

	copyright = new Buffer(copyright.join('\n'));

	callback(null, Buffer.concat([copyright, buffer]));
});

exports.concat = bone.wrapper(function(buffer, encoding, callback) {
	var option = this.option;
	var files = option.files || [];
	var destPath = this.destPath;
	var fs = this.fs;

	if(!Array.isArray(files)) {
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
});

exports.authorCopyright = bone.wrapper(exports.author, exports.copyright);

exports.authorCopyrightFixedOption = bone.wrapper(exports.author({author: 'wyicwx'}), exports.copyright({copyright: 'wyicwx'}));