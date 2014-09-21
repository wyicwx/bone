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
	// searchSync: function(search, option) {
	// 	option || (option = {});

	// 	search = this.pathResolve(search, option.dir || this.base);

	// 	var result = this.searchVirtual(search);
	// 	var data = glob.sync(search);
	// 	result = result.concat(data);
	// 	result = _.uniq(result);
	// 	// 忽略？
	// 	// result = _filterIgnore(result);
	// 	return result;
	// },
};


module.exports = MixFileSystem;
