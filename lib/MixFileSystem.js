var glob = require('glob'),
	path = require('path');

var VirtualFileSystem = require('./VirtualFileSystem.js');

function MixFileSystem(base) {
	this.base = path.resolve(base);
	this.vfs = new VirtualFileSystem(base);
}

MixFileSystem.prototype = {
	search: function(search, callback) {
		var vresult = this.vfs.search(search),
			Self = this;

		
		
		console.log(vresult);


		// , function(err, data) {
		// 	if(err) {
		// 		callback && callback(err, null);
		// 	} else {
		// 		data = data.map(function(value) {
		// 			return path.resolve(Self.base, value);
		// 		});
		// 		result = _.uniq(result.concat(data));
		// 		callback && callback(null, result);
		// 	}
		// });
	}
};


module.exports = MixFileSystem;
