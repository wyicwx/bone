var _ = require('lodash');
var through = require('through2');

function Plugins(processor, options) {
    this.processor = processor;
    this._options = options.options;
    this._filter = options.filter;
};

Plugins.prototype.getThroughStream = function() {
    var runtime = new Runtime(this._options);
    var plugins = this;

    var stream = through.obj(function(data, encoding, callback) {
        var content = data.buffer.toString();
        var fs = data.fs;

        _.extend(runtime, data);

        plugins.processor.call(runtime, content, encoding, function(error, content) {
            var buffer = content;
            if(typeof content == 'string') {
                buffer = new Buffer(content);
            }
            if(!error) {
                data.buffer = buffer;
                data.dependency = data.dependency.concat(runtime._dependencyList);
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
    if(!this._filter) {
        return true;
    } else {

    }
};

Plugins.prototype.runFinish = function() {
    
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

Runtime.prototype.cacheable = function(cacheable) {
    this._cacheable = true;
};

Runtime.prototype.addDependency = function(dependencyFile) {

};

module.exports.Plugins = Plugins;

module.exports.registerAction = function(moduleName) {
    var log = require('./log.js');
    try {
        var mod = require(moduleName);
    } catch(e) {
        log.error('registerAction', 'module "'+moduleName+' not found.');
    }
    if(!mod.act) {
        log.error('registerAction', 'module "'+moduleName+' not design for bone.');
    }

    return this.wrapper(mod.act);
};

module.exports.wrapper = function(act) {
    return function(options) {
        options || (options = {});

        var plugins = new Plugins(act, {
            options: options
        });


        return plugins;
    };
};