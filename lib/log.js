module.exports = function() {
	module.exports.log.apply(console, arguments);
};

module.exports.info = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	module.exports.info.count++;
	console.log([name || 'bone', '>>>'].join(' ').cyan, msg);
};
module.exports.info.count = 0;

module.exports.warn = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	module.exports.warn.count++;
	console.log([name || 'bone', '>>>'].join(' ').yellow, msg);
};
module.exports.warn.count = 0;

module.exports.log = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	module.exports.log.count++;
	console.log([name || 'bone', '>>>'].join(' '), msg);
};
module.exports.log.count = 0;

module.exports.error = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	var info = [name || 'bone', '>>>'].join(' ').red + ' ' + msg;
	var status = require('./kernel.js').status;
	if(status.test) {
		throw new Error(info);
	} else if(status.watch) {
		console.log(info);
	} else {
		console.log(info);
		process.exit(0);
	}
};

module.exports.debug = function(msg) {
	var isDebugMode = require('./kernel.js').status.debug;
	if(isDebugMode) {
		module.exports.debug.count++;
		console.log('debug >>>'.blueBG.white, msg);
	}
};
module.exports.debug.count = 0;