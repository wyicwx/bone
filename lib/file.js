'use strict';
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var minimatch = require('minimatch');
var Log = require('./log.js');
var FileSystem = require('./fs.js');

function File(destination, option) {
    option || (option = {});
    this.parentPath = option.parent || ''; // raw path
    this.destination = destination || '';
    this.source = null;
    this.renameFn = null;
    this.dirFn = null;
    this.cwdPath = option.cwd || '';
    this.acts = [];
    this.isTemporary = option.isTemporary || false;
}

File.prototype.dest = function(p) {
    if(!_.isString(p)) {
        throw new Error('dest() only support string!')
    }

    return new File(p, {
        parent: path.join(this.parentPath, this.destination),
        isTemporary: this.isTemporary
    });
};

File.prototype.cwd = function(cwd) {
    if(this.source) {
        throw new Error('call cwd() before src()!');
    }

    if(!_.isString(cwd)) {
        throw new Error('dest() only support string!')
    }

    var file = new File(this.destination, {
        parent: this.parentPath,
        cwd: cwd,
        isTemporary: this.isTemporary
    });

    return file;
};

File.prototype.src = function(src) {
    if(_.isArray(src)) {
        src.map(function(src) {
            if(!_.isString(src)) {
                throw new Error('src() only support string and string array!');
            }
        });
    } else if(!_.isString(src)) {
        throw new Error('src() only support string and string array!');
    }

    var file = new File(this.destination, {
        parent: this.parentPath,
        cwd: this.cwdPath,
        isTemporary: this.isTemporary
    });
    file.source = src;
    File.fileList.push(file);

    return file;
};

File.prototype.dir = function(dir) {
    if(!this.source) {
        throw new Error('call src() first!');
    }

    if(!_.isFunction(dir) && !_.isString(dir)) {
        throw new Error('dir() only support string and function!');
    }

    this.dirFn = dir;

    return this;
};

File.prototype.rename = function(fn) {
    if(!this.source) {
        throw new Error('call src() first!');
    }
    if(!fn) return;

    if(!_.isFunction(fn) && !_.isString(fn) && !_.isObject(fn)) {
        throw new Error('rename() only support string, function and object!');
    }

    this.renameFn = fn;

    return this;
};

File.prototype.act = function(fn) {
    if(!this.source) {
        throw new Error('call src() before act()!');
    }
    this.acts.push(fn);
    return this;
};

File.prototype.destroy = function() {
    if(!this.source) {
        throw new Error('call src() before destroy()!');
    }
    File.fileList = _.without(File.fileList, this);
};

File.prototype.temp = function(isTemporary) {
    this.isTemporary = isTemporary;

    return this;
};

File.fileList = [];
    
File.setup = function(file) {
    var bonefs = require('./fs.js').fs;
    var pathResolve = function() {
        return bonefs.pathResolve.apply(bonefs, arguments);
    }

    if(!file) {
        file = this.fileList;
    }

    if(_.isArray(file)) {
        return file.map(File.setup);
    }

    file.parentPath = pathResolve(file.parentPath);
    file.destPath = pathResolve(file.destination, file.parentPath);
    if(file.cwdPath) {
        file.cwdPath = pathResolve(file.cwdPath);
    }
    file.source = _.isArray(file.source) ? file.source : [file.source];

    _.each(file.source, function(src) {
        new FileFormat(src, file);
    });
};

function FileFormat(src, file) {
    // the File instance 
    this.file = file;
    this.src = src;
    // the source file array
    this.source = null;
    // source file's dir
    this.srcDir = '';

    this.initialize();
}

FileFormat.prototype.initialize = function() {
    var file = this.file;

    if(file.cwdPath) {
        this.source = this.pathResolve(this.src, file.cwdPath);
    } else {
        this.source = this.pathResolve(this.src, file.destPath);
    }

    if(this.hasGlobSyntax()) {
        this.srcDir = this.getGlobSearchPath();
    }

    if(this.hasGlobSyntax()) {
        this.glob();
    } else {
        this.register();
    }
};

FileFormat.prototype.glob = function() {
    var bonefs = require('./fs.js').fs;
    var result = bonefs.search(this.source, {searchAll: true});

    if(result.length) {
        _.each(result, function(source) {
            source = this.pathResolve(source);
            // it's be supported what virtual file
            if(!bonefs.existFile(source, {notFs: true})) {
                // filter folder
                var stat = fs.statSync(source);
                if(!stat.isFile()) return;
            }
            this.register(source);
        }, this);
    } else {
        // warn
        Log.warn('Not exists: '+this.source);
    }
};

FileFormat.prototype.register = function(source) {
    var bonefs = FileSystem.fs;

    if(!this.hasGlobSyntax()) {
        source = this.source;
        if(!bonefs.existFile(source)) {
            Log.warn('Not exists: '+source);
            return;
        }
    }

    var dest, dir, destPath = this.file.destPath;

    if(this.srcDir) {
        dir = path.relative(this.srcDir, path.dirname(source));
        dir = dir.split(path.sep).join('/');
    } else {
        dir = '';
    }

    if(this.file.dirFn !== null) {
        if(_.isString(this.file.dirFn)) {
            dir = this.file.dirFn;
        } else if(_.isFunction(this.file.dirFn)) {
            dir = this.file.dirFn.call(null, dir, source, destPath);
        }
    }

    dest = path.join(destPath, dir, path.basename(source));


    dest = this.rename(source, dest);
    FileSystem.register(dest, {
        src: source,
        acts: _.clone(this.file.acts),
        temp: this.file.isTemporary
    });
};

FileFormat.prototype.pathResolve = function() {
    var bonefs = require('./fs.js').fs;
    return bonefs.pathResolve.apply(bonefs, arguments);
};

FileFormat.prototype.hasGlobSyntax = function() {
    return this.getGlobSearchPath() != this.source;
};

FileFormat.prototype.getGlobSearchPath = function() {
    if(!this.globSearchPath) {
        var mmatch = minimatch.Minimatch(this.source);
        var result = [];
        var matchArray = mmatch.set[0];

        for(var i = 0, length = matchArray.length; i < length; i++) {
            if(_.isString(matchArray[i])) {
                result.push(matchArray[i]);
            } else {
                break;
            }
        }

        this.globSearchPath = this.pathResolve(result.join('/'));
    }
    return this.globSearchPath;
};

FileFormat.prototype.rename = function(source, dest) {
    var file = this.file;
    var fileProperty = path.parse(source);

    if(_.isFunction(file.renameFn)) {
        fileProperty.base = file.renameFn.call(null, fileProperty.base, source, _.clone(fileProperty));
    } else if(_.isString(file.renameFn)) {
        fileProperty.base = file.renameFn;
    } else if(_.isObject(file.renameFn)) {
        var renameOption = file.renameFn;
        if(renameOption.name) {
            fileProperty.name = renameOption.name;
        }
        if(renameOption.ext) {
            if(renameOption.ext.indexOf('.') != 0) {
                fileProperty.ext = '.'+renameOption.ext;
            } else {
                fileProperty.ext = renameOption.ext;
            }
        }
        fileProperty.base = fileProperty.name + fileProperty.ext;
    }
    fileProperty.dir = path.dirname(dest);
    dest = path.format(fileProperty);

    return dest;
};

module.exports = File;