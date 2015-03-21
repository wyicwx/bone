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
		return function(option) {
			var scope = {
				option: option || {}
			};
			scope.option.defaults = function(obj) {
				obj || (obj = {});
				return _.extend(obj, option);
			}
			return function() {
				var runScope = _.clone(scope);
				var stream = through(function(buffer, encoding, callback) {
					var cb = function(err, data) {
						// 防止内存泄漏
						runScope.argvs = null;
						callback(err, data);
					};
					runScope.argvs = {
						buffer: buffer,
						encoding: encoding,
						callback: cb
					};
					fn.call(runScope, buffer, encoding, cb);
				});
				stream.runtime = runScope;
				return stream;
			}
		};
	}
}

exports.wrapper = wrapper;

var watcher;
function autoRefresh() {
	var chokidar = require('chokidar');
	var bone = require('./kernel.js');

	if(!watcher) {
		watcher = chokidar.watch(bone.fs.base, {
			ignored: /[\/\\]node_modules/
		});
		process.nextTick(function() {
			watcher.on('ready', function() {
				watcher.on('all', function(event, path) {
					switch(event) {
						case 'add':
						case 'addDir':
						case 'unlink':
						case 'unlinkDir':
							bone.fs.refresh();
						break;
					}
				});
			});
			watcher.on('error', function(err) {
				throw err;
			});
		});
	}
	return watcher;
}

exports.autoRefresh = autoRefresh;