'use strict';
var through = require('through2'),
	origin = require('akostream').origin,
	_ = require('underscore');

/*
	usage: 
		wrapper(function(buffer, encoding, callback) {
			var option = this.option;
			var fileinfo = this.info;
			
		});

		wrapper(include(), less());
 */
function wrapper(fn) {
	if(arguments.length > 1) {
		var fns = _.toArray(arguments);

		var streams = [];
		_.each(fns, function(fn) {
			if(fn.length == 1) {
				streams.push(fn());
			} else {
				streams.push(fn);
			}
		});

		return wrapper(function(buffer, encoding, callback) {
			var scope = this;
			var start = origin(buffer);
			var end = through(function(buffer) {
				callback(buffer);
			});
			var transfer = start;
			_.each(streams, function(stream) {
				stream = stream();
				_.extend(stream.runtime, scope, stream.runtime);
				transfer = transfer.pipe(stream);
			});
			transfer.pipe(end);

		});
	} else if(fn) {
		return function(option) {
			var scope = {
				option: option || {}
			};
			scope.option.defaults = function(obj) {
				return _.extend(obj, option);
			}
			return function() {
				var runScope = _.clone(scope);
				var stream = through(_.bind(fn, runScope));
				stream.runtime = runScope;
				return stream;
			}
		};
	}
}

exports.wrapper = wrapper;