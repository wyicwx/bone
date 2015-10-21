var _ = require('underscore');

function print() {
	var args = _.toArray(arguments);
	var bone = require('../index.js');

	if(bone.status.debug) {
		
	} else {
		process.stdout.write(args.join(' ')+'\n');
	}
}


module.exports = function() {
	module.exports.log.apply(console, arguments);
};

module.exports.info = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	module.exports.info.count++;
	print([name || 'bone', '>>'].join(' ').cyan, msg);
};
module.exports.info.count = 0;

module.exports.warn = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	module.exports.warn.count++;
	var status = require('./kernel.js').status;
	if(status.watch) {
		msg += '\x07';
	}
	print([name || 'bone', '>>'].join(' ').yellow, msg);
};
module.exports.warn.count = 0;

module.exports.log = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	module.exports.log.count++;
	print([name || 'bone', '>>'].join(' '), msg);
};
module.exports.log.count = 0;

module.exports.error = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	var status = require('./kernel.js').status;
	if(status.watch) {
		msg += '\x07';
	}
	var info = [name || 'bone', '>>'].join(' ').red + ' ' + msg;
	if(status.test) {
		throw new Error(info);
	} else if(status.watch) {
		print(info);
	} else {
		print(info);
		process.exit(-1);
	}
};

module.exports.debug = function(msg) {
	var isDebugMode = require('./kernel.js').status.debug;
	if(isDebugMode) {
		module.exports.debug.count++;
		print('debug >>'.blueBG.white, msg);
	}
};
module.exports.debug.count = 0;