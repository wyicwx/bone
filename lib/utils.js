var _ = require('underscore');
var stream = require('akostream');



var utils = {};

utils.stream = stream;

utils.fs = {
	// track file stack
	track: function(file) {
		var bone = require('./kernel.js');
		var ReadStream = require('./ReadStream.js');

		file = bone.fs.pathResolve(file);
		var readStream = new ReadStream(filePath, {encoding: option.encoding});

		return _.clone(readStream.trackStream);
	},
	// resolve relative dependent file
	dependentFile: function(file, callback) {
		var bone = require('bone');
		var createReadStream = bone.fs.createReadStream;

		var dependencies = this.track(file);

		bone.fs.createReadStream = function(file) {
			var args = _.toArray(arguments);

			dependencies.push(bone.fs.pathResolve(file));

			return createReadStream.apply(bone.fs, args);
		};

		bone.fs.readFile(file, function() {
			// restore
			bone.fs.createReadStream = createReadStream;
			dependencies = _.uniq(dependencies);
			callback && callback();
		});
	}
};

module.exports = _.extend(utils, _);