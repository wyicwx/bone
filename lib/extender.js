var _ = require('lodash');

function Extender(processor, options) {
    this.processor = processor;
    this.runtime = new Runtime({
        options: options
    });
};

Extender.prototype.getRuntime = function() {
    return this.runtime;
};

Extender.prototype.runStart = function(buffer, encoding, callback) {
    var extender = this;

    this.processor.call(this.runtime, buffer, function(error, result) {
        extender.runFinish();
        callback(error, result);
    });
};

Extender.prototype.runFinish = function() {
    
};

function Runtime = function(options) {
    this.options = options.options || {};
    this._cacheable = false;
    this._capturefs = false;
};

Runtime.prototype.options = function(options) {
    return _.extend({}, this.options, options);
};

Runtime.prototype.cacheable = function(cacheable) {
    this._cacheable = true;
};

Runtime.prototype.captureDependencyByFs = function() {
    this._capturefs = true;
};

Runtime.prototype.addDependency = function() {

};



function wrapper(fn, defaultInfo) {
    defaultInfo || (defaultInfo = {});

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
        };
    };
}



exports.wrapper = wrapper;