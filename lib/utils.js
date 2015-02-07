var _ = require('underscore');
var stream = require('akostream');
var async = require('async');

var utils = {};

utils.stream = stream;

utils.async = async;

utils.fs = {
	// track file stack
	track: function(file) {
		var bone = require('./kernel.js');
		var ReadStream = require('./ReadStream.js');

		if(bone.fs.existFile(file)) {
			file = bone.fs.pathResolve(file);
			var readStream = new ReadStream(file);

			return _.clone(readStream.trackStack);
		} else {
			return false;
		}
	},
	// resolve relative dependent file
	dependentFile: function(file, callback) {
		var bone = require('./kernel.js');
		var createReadStream = bone.fs.createReadStream;

		if(!bone.fs.existFile(file)) {
			return callback('not exist file');
		}
		var dependenciesTmp = [file];

		bone.fs.createReadStream = function(file) {
			var args = _.toArray(arguments);

			dependenciesTmp.push(bone.fs.pathResolve(file));

			return createReadStream.apply(bone.fs, args);
		};

		bone.fs.readFile(file, function() {
			var dependencies = [];
			// track over dependent file
			dependenciesTmp.forEach(function(f) {
				dependencies = dependencies.concat(utils.fs.track(f));
			});
			// restore
			bone.fs.createReadStream = createReadStream;
			// deduplication
			dependencies = _.uniq(dependencies);
			callback && callback(null, dependencies);
		});
	}
};

module.exports = _.extend(utils, _);