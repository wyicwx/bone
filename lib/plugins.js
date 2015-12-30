var _ = require('lodash');
var through = require('through2');
var FileSystem = require('./fs.js');
var Log = require('./log.js');

function Plugins(processor, options) {
    this.processor = processor;
    this._options = options.options;
    this._filter = options.filter;
};

Plugins.prototype._formatFilter = function() {
    if(_.isObject(this._filter)) {
        // format all to array
        if(this._filter.ext) {
            if(_.isString(this._filter.ext)) {
                this._filter.ext = this._filter.ext.split(',');
            } else if(_.isObject(this._filter.ext)) {
                this._filter.ext = null;
            }
        }

        if(this._filter.name) {
            if(_.isString(this._filter.name)) {
                this._filter.name = this._filter.name.split(',');
            } else if(_.isObject(this._filter.name)) {
                this._filter.name = null;
            }
        }

        if(this._filter.base) {
            if(_.isString(this._filter.base)) {
                this._filter.base = this._filter.base.split(',');
            } else if(_.isObject(this._filter.base)) {
                this._filter.base = null;
            }
        }
    }
};

Plugins.prototype.getThroughStream = function() {
    var runtime = new Runtime(this._options);
    var plugins = this;

    var stream = through.obj(function(data, encoding, callback) {
        var content = data.buffer.toString();
        var fs = data.fs;

        _.extend(runtime, data);
        // filter processor 
        if(!plugins.filter()) {
            return callback(null, data);
        }
        plugins.processor.call(runtime, content, encoding, function(error, content) {
            var buffer = content;
            if(typeof content == 'string') {
                buffer = new Buffer(content);
            }
            if(!error) {
                data.buffer = buffer;
                data.dependency = data.dependency.concat(runtime._dependencyList);
                if(runtime._cacheable == false) {
                    data.cacheable = false;
                }
            }

            callback(error, data);
        });
    }, function(callback) {
        // do something when act run done.
        callback(null);
    });

    return stream;
};

Plugins.prototype.filter = function() {
    if(this._filter) {
        var runtimeInfo = _.pick(this, 'source', 'sourceParsed', 'destination', 'destinationParsed');

        if(_.isFunction(this._filter)) {
            return this._filter.call(null, runtimeInfo);
        } else if(_.isObject(this._filter)){
            if(this._filter.ext) {
                if(_.indexOf(this._filter.ext, runtimeInfo.sourceParsed) != -1) {
                    return true;
                }
            }
            if(this._filter.name) {
                if(_.indexOf(this._filter.name, runtimeInfo.sourceParsed) != -1) {
                    return true;
                }
            }
            if(this._filter.base) {
                if(_.indexOf(this._filter.base, runtimeInfo.sourceParsed) != -1) {
                    return true;
                }
            }
            
            return false;
        }
    }
    return true;
};

function Runtime(options) {
    this._options = options || {};
    this._cacheable = false;
    this._dependencyList = [];
    this.bone = require('./kernel.js');
};

Runtime.prototype.options = function(options) {
    return _.extend({}, options, this._options);
};

Runtime.prototype.cacheable = function() {
    this._cacheable = true;
};

Runtime.prototype.addDependency = function(dependencyFile) {
    if(!_.isString(dependencyFile)) {

    }
        FileSystem.fs.pathResolve()
};

module.exports.Plugins = Plugins;

module.exports.registerAction = function(moduleName) {
    var log = require('./log.js');
    var act;
    try {
        var mod = require(moduleName);
    } catch(e) {
        log.error('registerAction', 'module "'+moduleName+' not found.');
    }
    if(_.isFunction(mod)) {
        act = mod;
    } else {
        if(!mod.act) {
            log.error('registerAction', 'module "'+moduleName+' not design for bone.');
        } else {
            act = mod.act;
        }
    }

    return this.wrapper(act, mod);
};

module.exports.wrapper = function(act, mod) {
    return function(options, info) {
        options || (options = {});
        info || (info = {});

        var plugins = new Plugins(act, {
            options: options,
            filter: info.filter || mod.filter
        });


        return plugins;
    };
};