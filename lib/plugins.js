var _ = require('lodash');
var through = require('through2');
var FileSystem = require('./fs.js');
var Log = require('./log.js');
var resolve = require('resolve');

function Plugins(processor, options) {
    this.processor = processor;
    this.name = options.name || null;
    this._options = options.options;
    this._filter = options.filter;
    this._formatFilter();
};

Plugins.prototype._formatFilter = function() {
    if(_.isObject(this._filter)) {
        // format all to array
        if(this._filter.ext) {
            if(_.isString(this._filter.ext)) {
                this._filter.ext = this._filter.ext.split(',');
            } else if(!_.isArray(this._filter.ext)) {
                this._filter.ext = null;
            }
        }

        if(this._filter.name) {
            if(_.isString(this._filter.name)) {
                this._filter.name = this._filter.name.split(',');
            } else if(!_.isArray(this._filter.name)) {
                this._filter.name = null;
            }
        }

        if(this._filter.base) {
            if(_.isString(this._filter.base)) {
                this._filter.base = this._filter.base.split(',');
            } else if(!_.isArray(this._filter.base)) {
                this._filter.base = null;
            }
        }
    }
};

Plugins.prototype.getThroughStream = function() {
    var runtime = new Runtime(this._options);
    var plugins = this;

    var stream = through.obj(function(data, encoding, callback) {
        var fs = data.fs;

        _.extend(runtime, _.pick(data, ['source', 'sourceParsed', 'destination', 'destinationParsed', 'fs']));
        // filter processor 
        if(!plugins.filter(runtime)) {
            bone.log.debug('filter false! name: '+plugins.name+'! source: '+runtime.source);
            return callback(null, data);
        }

        plugins.processor.call(runtime, data.buffer, encoding, function(error, content) {
            if(error) {
                return callback(error);
            }

            var buffer = content;

            if(typeof content == 'string') {
                buffer = new Buffer(content);
            }

            data.buffer = buffer;
            data.dependency = data.dependency.concat(runtime._dependencyList);
            if(runtime._cacheable == false) {
                data.cacheable = false;
            }

            callback(null, data);
        });
    });

    return stream;
};

Plugins.prototype.filter = function(runtime) {
    if(this._filter) {
        var runtimeInfo = _.pick(runtime, 'source', 'sourceParsed', 'destination', 'destinationParsed');

        if(_.isFunction(this._filter)) {
            return this._filter.call(null, runtimeInfo);
        } else if(_.isObject(this._filter)){
            if(this._filter.ext) {
                if(_.indexOf(this._filter.ext, runtimeInfo.sourceParsed.ext) != -1) {
                    return true;
                } else {
                    return false;
                }
            }
            if(this._filter.name) {
                if(_.indexOf(this._filter.name, runtimeInfo.sourceParsed.name) != -1) {
                    return true;
                } else {
                    return false;
                }
            }
            if(this._filter.base) {
                if(_.indexOf(this._filter.base, runtimeInfo.sourceParsed.base) != -1) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
    return true;
};

function Runtime(options) {
    this._options = options || {};
    this._cacheable = false;
    this._dependencyList = [];
    this.bone = bone;
};

Runtime.prototype.options = function(options) {
    return _.extend({}, options, this._options);
};

Runtime.prototype.cacheable = function() {
    this._cacheable = true;
};

Runtime.prototype.addDependency = function(dependencyFile) {
    var dependencyList = this._dependencyList;
    if(_.isArray(dependencyFile)) {
        _.each(dependencyFile, function(file) {
            dependencyList.push(FileSystem.fs.pathResolve(file));
        });
    } else if(_.isString(dependencyFile)) {
        dependencyList.push(FileSystem.fs.pathResolve(dependencyFile));
    }
};

module.exports.Plugins = Plugins;

module.exports.registerAction = function(moduleName) {
    var log = require('./log.js');
    var act;

    try {
        var mod = resolve.sync(moduleName, {basedir: bone.status.base});
    } catch(e) {}
    if(mod) {
        mod = require(mod);
    } else {
        try {
            var mod = require(moduleName);
        } catch(e) {
            throw e;
        }
    }

    mod.name = moduleName;

    if(_.isFunction(mod)) {
        act = mod;
    } else {
        if(!mod.act) {
            log.error('require', 'module "'+moduleName+' not design for bone.');
        } else {
            act = mod.act;
        }
    }

    return this.wrapper(act, mod);
};

module.exports.wrapper = function(act, mod) {
    mod || (mod = {});
    return function(options, info) {
        options || (options = {});
        info || (info = {});

        var plugins = new Plugins(act, {
            options: options,
            filter: info.filter || mod.filter,
            name: mod.name
        });

        return plugins;
    };
};