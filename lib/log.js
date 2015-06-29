
module.exports = function() {
	module.exports.log.apply(console, arguments);
};

module.exports.info = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	console.log([name || 'bone', '>>>'].join(' ').cyan, ' ', msg);
};

module.exports.warn = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	console.log([name || 'bone', '>>>'].join(' ').yellow, ' ', msg);
};

module.exports.log = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	console.log([name || 'bone', '>>>'].join(' '), ' ', msg);
};

module.exports.error = function(name, msg) {
	if(!msg) {
		msg = name;
		name = null;
	}
	console.log([name || 'bone', '>>>'].join(' ').red, ' ', msg);
};

module.exports.debug = function(msg) {
	var isDebugMode = require('./kernel.js').debug;
	if(isDebugMode) {
		console.log('debug >>>'.blueBG.white, msg);
	}
};