var EventEmitter = require('events').EventEmitter;

var status = new EventEmitter();

function defineProperty(key, value) {
	var innerValue = value;
	Object.defineProperty(status, key, {
		get: function() {
			return innerValue;
		},
		set: function(value) {
			innerValue = value;
			status.emit('change');
			status.emit('change:'+key, value);
		},
		enumerable : true,
		configurable : true
	});
}

// debug mode
defineProperty('debug', false);
// test mode
defineProperty('test', false);
// forever mode
defineProperty('forever', false);

module.exports = status;