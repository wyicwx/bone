var _ = require('lodash');
var Data = require('./data.js');
var through = require('through2');

function print() {
    var args = _.toArray(arguments);
    var stdout = process.stdout;

    if(bone.status.test) {
        if(!print.stream) {
            if(!Data.logInfo) {
                Data.logInfo = [];
            }
            print.stream = through(function(buffer, encoding, callback) {
                Data.logInfo.push(buffer.toString());
                callback(null, buffer);
            });
        }

        stdout = print.stream;
    }

    stdout.write(args.join(' ')+'\n');
}


module.exports = function() {
    module.exports.log.apply(console, arguments);
};

module.exports.info = function(name, msg) {
    if(!msg) {
        msg = name;
        name = null;
    }
    module.exports.info.count++;
    print([name || 'bone', '>>'].join(' ').cyan, msg);
};
module.exports.info.count = 0;

module.exports.warn = function(name, msg) {
    if(!msg) {
        msg = name;
        name = null;
    }
    module.exports.warn.count++;
    var status = require('./kernel.js').status;
    if(status.watch) {
        msg += '\x07';
    }

    print([name || 'bone', '>>'].join(' ').yellow, msg);
};
module.exports.warn.count = 0;

module.exports.log = function(name, msg) {
    if(!msg) {
        msg = name;
        name = null;
    }
    module.exports.log.count++;
    print([name || 'bone', '>>'].join(' '), msg);
};
module.exports.log.count = 0;

module.exports.error = function(name, msg) {
    if(!msg) {
        msg = name;
        name = null;
    }
    var status = require('./kernel.js').status;

    var info = [name || 'bone', '>>'].join(' ').red + ' ' + msg;

    throw new Error(info);
};

module.exports.debug = function(msg) {
    var isDebugMode = require('./kernel.js').status.debug;
    if(isDebugMode) {
        module.exports.debug.count++;
        print('debug >>'.blueBG.white, msg);
    }
};
module.exports.debug.count = 0;