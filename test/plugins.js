'use strict';
var assert = require('assert');
var log = require('../lib/log.js');
var bone = require('../index.js');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Plugins = require('../lib/plugins.js').Plugins;
var FileSystem = require('../lib/fs.js');
var bonefs;

bone.setup('./test/raw');
bonefs = FileSystem.fs;

function act(buffer, encoding, callback) {
    callback(null, buffer);
}

var runtimeJsFile = {
    source: '/tmp/runtime.js',
    sourceParsed: path.parse('/tmp/runtime.js'),
    destination: '/tmp/dest/runtime.js',
    destinationParsed: path.parse('/tmp/dest/runtime.js')
};
var runtimeExtJsFile = {
    source: '/tmp/runtime_ext.js',
    sourceParsed: path.parse('/tmp/runtime_ext.js'),
    destination: '/tmp/dest/runtime_ext.js',
    destinationParsed: path.parse('/tmp/dest/runtime_ext.js')
};
var runtimeCssFile = {
    source: '/tmp/runtime.css',
    sourceParsed: path.parse('/tmp/runtime.css'),
    destination: '/tmp/dest/runtime.css',
    destinationParsed: path.parse('/tmp/dest/runtime.css')
};
var runtimeHtmlFile = {
    source: '/tmp/runtime.html',
    sourceParsed: path.parse('/tmp/runtime.html'),
    destination: '/tmp/dest/runtime.html',
    destinationParsed: path.parse('/tmp/dest/runtime.html')
};

bone.status.test = true;
bone.status.watch = true;

describe('plugins', function() {
    it('require module what plugins not design for bone will throw error', function() {
        assert.throws(function() {
            bone.require('colors');
        });
    });

    it('require module what not exits will throw error', function() {
        assert.throws(function() {
            bone.require('fantasy_module');
        });
    });

    it('function filter', function() {
        var pluginsAlwaysTrue = new Plugins(act, {
            filter: function() {
                return true;
            }
        });

        var pluginsAlwaysFalse = new Plugins(act, {
            filter: function() {
                return false;
            }
        });

        if(!pluginsAlwaysTrue.filter(runtimeJsFile)) {
            assert.ok(false);
        }

        if(pluginsAlwaysFalse.filter(runtimeJsFile)) {
            assert.ok(false);
        }
    });

    it('ext filter', function() {
        var pluginsString = new Plugins(act, {
            filter: {
                ext: '.js,.css'
            }
        });

        var pluginsArray = new Plugins(act, {
            filter: {
                ext: ['.js', '.css']
            }
        });

        var pluginsObject = new Plugins(act, {
            filter: {
                ext: {}
            }
        });

        if(!pluginsString.filter(runtimeJsFile) || !pluginsString.filter(runtimeCssFile)) {
            assert.ok(false);
        }

        if(!pluginsArray.filter(runtimeJsFile) || !pluginsString.filter(runtimeCssFile)) {
            assert.ok(false);
        }

        if(!pluginsObject.filter(runtimeJsFile) || !pluginsObject.filter(runtimeCssFile)) {
            assert.ok(false);
        }

        if(!pluginsObject.filter(runtimeJsFile)) {
            assert.ok(false);
        }

        if(pluginsString.filter(runtimeHtmlFile) || pluginsArray.filter(runtimeHtmlFile)) {
            assert.ok(false);
        }
    });

    it('name filter', function() {
        var pluginsString = new Plugins(act, {
            filter: {
                name: 'runtime,runtime_ext'
            }
        });

        var pluginsArray = new Plugins(act, {
            filter: {
                name: ['runtime', 'runtime_ext']
            }
        });

        var pluginsObject = new Plugins(act, {
            filter: {
                name: {}
            }
        });

        if(!pluginsString.filter(runtimeJsFile) || !pluginsString.filter(runtimeExtJsFile)) {
            assert.ok(false);
        }

        if(!pluginsArray.filter(runtimeJsFile) || !pluginsString.filter(runtimeExtJsFile)) {
            assert.ok(false);
        }

        if(!pluginsObject.filter(runtimeJsFile) || !pluginsObject.filter(runtimeExtJsFile)) {
            assert.ok(false);
        }
    });

    it('base filter', function() {
        var pluginsString = new Plugins(act, {
            filter: {
                base: 'runtime.js,runtime.css'
            }
        });

        var pluginsArray = new Plugins(act, {
            filter: {
                base: ['runtime.js', 'runtime.css']
            }
        });

        var pluginsObject = new Plugins(act, {
            filter: {
                base: {}
            }
        });
        if(!pluginsString.filter(runtimeJsFile) || !pluginsString.filter(runtimeCssFile)) {
            assert.ok(false);
        }

        if(!pluginsArray.filter(runtimeJsFile) || !pluginsString.filter(runtimeCssFile)) {
            assert.ok(false);
        }

        if(!pluginsObject.filter(runtimeJsFile) || !pluginsObject.filter(runtimeCssFile)) {
            assert.ok(false);
        }
    });

    it('options() set default value for some key', function(done) {
        bonefs.readFile('~/dev/js/hello_copyright_default.js', function(err, buffer) {
            var content = buffer.toString();

            if (~content.search('@copyright anonymous')) {
                done();
            } else {
                done(false);
            }
        });
    });
});