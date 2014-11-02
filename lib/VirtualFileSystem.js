var path = require('path'),
	minimatch = require('minimatch'),
	glob = require('glob'),
	_ = require('underscore');
	fs = require('fs'),
	origin = require('akostream').origin,
	aggre = require('akostream').aggre,
	combine = require('akostream').combine;


function _init(Self) {
	if(!Self.base) {
		throw new Error('must be set root');
	} else {
		
	}

	Self.pathHashMap = parsed.result;
	Self.pathList = parsed.list;
}
// 解析入口
function _parse(option) {
	var toBatch = [];
	var result = {};

	_parseTree(option.tree, option.dir, toBatch, result);
	_parseBatch(toBatch, {
		dir: option.dir,
		existFile: result,
		vfs: option.vfs,
		result: result
	});

	return {
		result: result,
		list: _.keys(result)
	}
}
// 树解析
function _parseTree(tree, parentFolder, batch, result) {
	result || (result = {});
	_.each(tree, function(subtree, dir) {
		var currentPath = path.join(parentFolder, dir);

		if(_.isObject(subtree) && !_.isArray(subtree)) {
			_parseTree(subtree, currentPath, batch, result);
		} else {
			if(dir === '*') {
				// 批处理
				subtree.forEach(function(config) {
					if(config.file) {
						if(!_.isArray(config.file)) {
							config.file = [config.file];
						}
						_.each(config.file, function(file) {
							batch.push({
								dir: parentFolder,
								config: _.extend({}, config, {
									file: file
								})
							});
						});
					}
				});
			} else {
				currentPath = VFS.formatPath(currentPath);

				// 目前只支持string和array两种定义
				if(_.isString(subtree)) {
					result[currentPath] = [subtree];
				} else if(_.isArray(subtree) && _.size(subtree)) {
					result[currentPath] = subtree;
				} else {
					console.log('The path %s was be throw away!', currentPath);
				}
			}
		}
	});

	return result;
}
// 通配符解析
function _parseBatch(toBatch, option) {
	var vfs = option.vfs;

	function _getPath(p) {
		var mmatch = minimatch.Minimatch(p);
		var result = [];
		var matchArray = mmatch.set[0];

		for(var i = 0, length = matchArray.length; i < length; i++) {
			if(_.isString(matchArray[i]) && (i < length - 1)) {
				result.push(matchArray[i]);
			} else {
				break;
			}
		}

		return result.join('/');
	}

	function _search(searchValue) {
		var existSearchResult = minimatch.match(vfs.pathList, searchValue, {});
		var searchResult = minimatch.match(_.keys(option.result), searchValue, {});
		var data = glob.sync(searchValue);
		var result = existSearchResult.concat(searchResult).concat(data);

		result = _.uniq(result);
		return result;
	}
	/**
	 * {
	 * 	 dir: '/xx/bb/aa',
	 * 	 config: {
	 * 	 	processor: '',
	 * 	 	file: ''
	 * 	 },
	 * 	 type: 'widcard'
	 * }
	 */
	toBatch.forEach(function(data) {
		// 通配符
		var fullPath = VFS.pathResolve(data.config.file, data.dir);
		var searchDir = _getPath(fullPath);
		var result = _search(fullPath);

		_.each(result, function(originalFilePath) {
			var targetFilePath = originalFilePath;

			if(data.config.hasOwnProperty('rename')) {
				var oldFileName = path.basename(originalFilePath);
				var newFileName;
				var rename = data.config.rename;

				if(_.isObject(rename)) {
					newFileName = data.config.rename[oldFileName] || oldFileName;
				} else if(_.isFunction(rename)) {
					newFileName = rename.call(null, oldFileName);
				}
				
				if(!newFileName) return;

				targetFilePath = targetFilePath.replace(new RegExp(oldFileName+'$'), newFileName);
			}

			// 替换文件夹
			targetFilePath = targetFilePath.replace(searchDir, '');
			targetFilePath = path.join(data.dir, targetFilePath);

			option.result[targetFilePath] = [_.extend({}, data.config, {file: originalFilePath})];
		});
	});
}


// 判断是否含有通配符
function _hasWildCard(str) {
	var match = new minimatch.Minimatch(str);
	var has = false;

	_.each(match.set[0], function(value) {
		if(!_.isString(value)) {
			has = true;
		}
	});
	return has;
}
function VFS(base) {
	this.base = base;
	this.pathHashMap = {};
	this.pathList = [];
	this.fileTree = {};
	// 记录已经解析过的路径
	this.resolvedPath = {};
}

VFS.prototype = {
	search: function(search, option) {
		option || (option = {});

		search = VFS.pathResolve(search, option.dir || this.base);
		var virtual = minimatch.match(this.pathList, search, {});
		var real = glob.sync(search, {cwd: this.base});

		var result = _.uniq(virtual.concat(real));
		return result;
	},
	/**
		解析文件路径
		string -> search -> string array
	 */
	resolveFile: function(filePath, option) {
		filePath = this.pathResolve(filePath);
		// 不解析已经解析过的文件
		option || (option = {});

		if(!this.exists(filePath)) {
			return [filePath];
		}
		if(!(filePath in this.resolvedPath)) {
			var rawContent = this.pathHashMap[filePath];
			var resolved = [];
			// 
			// 'xxxx': [
			// 		'file',
			// 		{
			// 			processor: 'xx',
			// 			file: ''
			// 		}
			// ]
			// 
			rawContent.forEach(function(item) {
				if(_.isString(item)) {
					if(_hasWildCard(item)) {
						// console.log(item);
						// console.log(option.dir);
						resolved = resolved.concat(this.searchSync(item, {dir: option.dir}));
					} else {
						resolved.push(this.pathResolve(item, option.dir));
					}
					// 模糊搜索
				} else if(_.isObject(item)) {
					resolved.push(item);
					// item.dir = option.dir || this.base;
					//  = resolved.concat(this.resolveProcessor(item));
				}
			}, this);
			// config.list[this.path] = resolved;
			this.resolvedPath[filePath] = resolved;
		}

		return this.resolvedPath[filePath];
	},
	/**
		processor ->  processor [file array]
	*/
	resolveProcessor: function(item) {
		option || (option = {});

		if(item.file) {
			if(_.isString(item.file)) {
				item.file = [item.file];
			}
			
			// 数组类型的file,对每一个都解析
			var files = [];
			_.each(item.file, function(file) {
				if(_hasWildCard(file)) {
					files = files.concat(this.searchSync(file, item.dir));
				} else {
					files.push(this.pathResolve(file, item.dir));
				}
			}, this);

			item.file = files;
		}
	},
	exists: function(filePath) {
		filePath = this.pathResolve(filePath);

		return filePath in this.pathHashMap;
	},
	pathResolve: function(filepath, dir) {
		return VFS.pathResolve(filepath, dir, this.base);
	},
	addTree: function(tree, override) {
		var parsed = _parse({
			dir: this.base,
			tree: tree,
			vfs: this
		});

		if(override) {
			this.pathHashMap = _.extend({}, this.pathHashMap, parsed.result);
		} else {
			this.pathHashMap = _.extend({}, parsed.result, this.pathHashMap);
		}

		this.pathList = _.keys(this.pathHashMap);
	},
	addProcessorTree: function(processorData) {
		var tree = {
			'__temp': {}
		};

		tree['__temp'][_.uniq('_uniq_')+'.processor'] = processorData;

		this.addTree(tree);
	},
	getDependence: function(filePath) {
		filePath = this.pathResolve(filePath);

		if(this.exists(filePath)) {
			var nrs = new newReadStream(filePath, {
				vfs: this
			});

			return nrs.dependentFile;
		}
		return false;
	},
	getStream: function(filePath) {
		filePath = this.pathResolve(filePath);

		var readStream = new newReadStream(filePath, {vfs: this});

		return readStream.toStream();
	}
};

// 格式化所有路径，
VFS.formatPath = function(p) {
	return p.split(path.sep).join('/');
};

// 解析路径
// 	./ 相对dir
// 	~/ 相对root
// 	/  绝对路径
// 	   相对dir
VFS.pathResolve = function(filepath, dir, root) {
	var first = filepath[0],
		result;

	dir || (dir = root);

	// 相对于dir的相对路径
	if(first == '.') {
		result = path.resolve(dir, filepath);
	} else if(first == path.sep) {
		result = path.resolve('/', filepath);
	} else if(first == '~') {
		filepath = filepath.replace(/^~+/, '');
		result = path.resolve(path.join(root, filepath));
	} else {
		result = path.resolve(dir, filepath);
	}

	return this.formatPath(result);
};

VFS.processor = {};

VFS.registerProcessor = function() {
	
};

// build hash 也是一条路
// -> 预解析
// -> 搜索 from list
// -> getFile from hash
// 
// parse access
// -> 遍历
// -> 搜索 ***
// -> getFile search tree
// 
// 
// 
// path/* b/* 
// path/* b/*
// 
// 

// get all 

// 匹配 /a/*.js
// /a/*  -> /b/* -> /a/*.js -> rename ? 
// 
// 匹配目标文件夹,




// 		// get hash
// 		if(this.pathHashMap[filePath]) {
// 			return this.pathHashMap[filePath];
// 		// parse
// 		} else if(_parseTree(this, filePath)) {
// 			return this.pathHashMap[filePath];
// 		// wildcard match
// 		// 虚拟文件先映射，真实文件也没办法获取
// 		// 
// 		} else if(_wildcardmatch(this, filePath)) {
// 			return this.pathHashMap[filePath];
// 		// null
// 		} else {
// 			return null;
// 		}
// 	},
// 	exists: function() {

// 	}
// };




module.exports = VFS;