var through = require('through2'),
	Stream = require('stream'),
	_ = require('underscore');

var bone = require('bone');

function pack(name, fn) {
	if(!_.isArray(name)) {
		if(!fn) {
			fn = name;
			name = null;
		}

		var processor = function(option) {
			return function(info) {		
				if(_.isFunction(option)) {
					option = option(info);
				} else {
					option || (option = {});
				}
				return through(function(buffer, encoding, callback) {
					fn.call({
						option: option,
						bone: bone
					}, buffer, encoding, callback);
				});
			}
		};

		if(name) {
		}
		
		return processor;
	} else {
		var processors = name;

		return function(info) {
			var startStream,
				currentStream;

			_.each(processors, function(processor) {
				var ret = processor(info);
				if(processor instanceof Stream) {
					if(!startStream) {
						currentStream = startStream = processor;
					} else {
						currentStream = currentStream.pipe(processor);
					}
				}
			});

			return startStream;
		}
	}
}

module.exports = pack;




bone.pack