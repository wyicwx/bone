'use strict';
var path = require('path'),
    fs = require('fs'),
    pkg = require('../package.json');

var bone = global.bone = {};
// bone状态
bone.status = {
    base: false,
    test: false,
    debug: false,
    watch: false
};
// support commander color
require('colors');

// version
bone.version = pkg.version;
// setup 
bone.setup = function(base) {
    if(this.setuped) return;

    this.setuped = true;

    bone.status.base = path.resolve(base);
};
// 
bone.run = function() {
    if(!this.setuped) return;

    var FileSystem = require('./fs.js');
    FileSystem.refresh();
};
// define dest
bone.dest = function(path) {
    var File = require('./file.js');
    var file = new File();
    return file.dest(path);
};
// utils
bone.utils = require('./utils.js');
// log
bone.log = require('./log.js');
// plugin wrapper
bone.wrapper = require('./plugins.js').wrapper;
// load & register act
bone.registerAction = bone.require = require('./plugins.js').registerAction;
// watch
bone.watch = require('./watch.js');

module.exports = bone;

