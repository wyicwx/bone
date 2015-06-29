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
	// dependentFile: function(file, callback) {
	// 	var bone = require('./kernel.js');
	// 	var createReadStream = bone.fs.createReadStream;

	// 	if(!bone.fs.existFile(file)) {
	// 		return callback('not exist file');
	// 	}
	// 	if(!bone.fs.existFile('~/bonefile.js')) {
	// 		throw new Error('dependentFile need bonefile.js!');
	// 	}

	// 	if(!bone.isChildProcess) {
	// 		var child = require('./process.js').fork();
	// 		child.send('utils.fs.dependentFile', file, function(result) {
	// 			console.log(result);
	// 			child.end();
	// 		});
	// 	} else {
	// 		var dependenciesTmp = [];

	// 		bone.fs.createReadStream = function(f) {
	// 			var args = _.toArray(arguments);

	// 			dependenciesTmp.push(bone.fs.pathResolve(f));

	// 			return createReadStream.apply(bone.fs, args);
	// 		};

	// 		bone.fs.readFile(file, function() {
	// 			var dependencies = [];
	// 			// track over dependent file
	// 			dependenciesTmp.forEach(function(f) {
	// 				dependencies = dependencies.concat(utils.fs.track(f));
	// 			});
	// 			// restore
	// 			bone.fs.createReadStream = createReadStream;
	// 			// deduplication
	// 			dependencies = _.uniq(dependencies);
	// 			// remove dest file
	// 			dependencies = _.without(dependencies, bone.fs.pathResolve(file));

	// 			callback && callback(null, dependencies);
	// 		});
	// 	}
	// }
};

module.exports = _.extend(utils, _);