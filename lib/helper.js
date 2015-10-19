'use strict';
var through = require('through2'),
	origin = require('akostream').origin,
	path = require('path'),
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
			if(fn.length > 0) {
				streams.push(fn());
			} else {
				streams.push(fn);
			}
		});

		return wrapper(function(buffer, encoding, callback) {
			var scope = this;
			var start = origin(buffer);
			var end = through(function(buffer) {
				callback(null, buffer);
			});

			var transfer = start;
			_.each(streams, function(stream) {
				stream = stream();
				_.extend(stream.runtime.option, scope.option.defaults(), stream.runtime.option.defaults());
				stream.runtime.source = scope.source;
				transfer = transfer.pipe(stream);
			});
			transfer.pipe(end);
		});
	} else if(fn) {
		return function(option, info) {
			var scope = {
				option: option || {}
			};
			info || (info = {});
			scope.option.defaults = function(obj) {
				obj || (obj = {});
				return _.extend(obj, option);
			}
			return function() {
				var runScope = _.clone(scope);
				var stream = through(function(buffer, encoding, callback) {
					if(info.filter && !info.filter(runScope)) {
						callback(null, buffer);
					} else {
						var cb = function(err, data) {
							// 防止内存泄漏
							_.each(runScope, function(value, key) {
								runScope[key] = null;
							});
							runScope = null;
							callback(err, data);
						};
						runScope.argvs = {
							buffer: buffer,
							encoding: encoding,
							callback: cb
						};
						fn.call(runScope, buffer, encoding, cb);
					}
				});
				stream.runtime = runScope;
				return stream;
			}
		};
	}
}

exports.wrapper = wrapper;

var watcher;
function autoRefresh(callback) {
	var Gaze = require('gaze').Gaze;
	var cache = require('./cache.js');
	var bone = require('./kernel.js');
	var FileSystem = require('./fs.js');

	bone.status.watch = true;
	// process.nextTick(function() {
		if(!watcher) {

			watcher = new Gaze('{!(node_modules)/**/*,!(node_modules)}', {
				src: bone.status.base,
				interval: 300
			});

			watcher.watched(function(err, watched) {
				console.log(watched);
			});

			watcher.on('all', function(event, path, oldpath) {
				switch(event) {
					case 'added':
					case 'deleted':
						cache.clean(path);
						FileSystem.refresh();
					break;
					case 'changed':
						cache.clean(path);
					break;
					case 'renamed':
						cache.clean(oldpath);
					default:
						cache.clean(path);
					break;
				}
			});

			watcher.on('error', function(err) {
				throw err;
			});

			callback && callback(watcher);
		} else {
			callback && callback(watcher);
		}
	// });
}
exports.autoRefresh = autoRefresh;