var glob = require('glob'),
	path = require('path');

var VirtualFileSystem = require('./VirtualFileSystem.js');

function MixFileSystem(base) {
	this.base = path.resolve(base);
	this.vfs = new VirtualFileSystem(base);
}

MixFileSystem.prototype = {
	search: function(search, callback) {
		var result = this.vfs.search(search),
			Self = this;

		glob(search, {cwd: this.base}, function(err, data) {
			if(err) {
				callback && callback(err, null);
			} else {
				data = data.map(function(value) {
					return path.resolve(Self.base, value);
				});
				result = _.uniq(result.concat(data));
				callback && callback(null, result);
			}
		});
	},
	exists: function(path, callback) {
		var virtualExists = this.fs.exists(path);

		if(virtualExists) {
			callback(true);
		} else {		
			fs.exists(path, function(exist) {
				callback(exist);
			});
		}
	}
};


module.exports = MixFileSystem;
