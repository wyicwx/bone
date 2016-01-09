var path = require('path');
var minimatch = require('minimatch');
var _ = require('lodash');
var glob = require('glob');
var fs = require('fs');
var aggre = require('akostream').aggre;
var mkdirp = require('mkdirp');
var Data = require('./data');

// file path src 
function FileSystem(base, option) {
    option || (option = {});
    this.base = this.pathResolve(base);
    if(option.captureFile) {
        this._readFiles = [];
    }
    if(option.defaultAct) {
        this.defaultAct = option.defaultAct;
    }
}

FileSystem.prototype.pathResolve = function(filepath, dir) {
    var first = filepath[0],
        root = path.resolve('/'),
        result;

    if(dir) {
        dir = this.pathResolve(dir);
    } else {
        dir = this.base;
    }
    
    if(filepath.indexOf(root) == 0) { // absolute
        result = path.resolve('/', filepath);
    } else if(first == '.') { // relative 
        result = path.resolve(dir, filepath);
    } else if(first == '~') { // virtual home
        filepath = filepath.replace(/^~+/, '');
        result = path.resolve(path.join(this.base, filepath));
    } else {
        result = path.resolve(dir, filepath);
    }

    result = path.normalize(result);
    result = result.split(path.sep).join('/');
    return result; // unix style
};

FileSystem.prototype.createReadStream = function(filePath, option) {
    option || (option = {});
    option.act = !option.act ? [] : (_.isArray(option.act) ? option.act : [option.act]);
    filePath = this.pathResolve(filePath);
    if(!this.existFile(filePath)) {
        throw new Error('file not exists: '+filePath);
    }

    if(this._readFiles) {
        this._readFiles.push(filePath);
    }
    if(this.defaultAct) {
        if(_.isArray(this.defaultAct)) {
            option.act = option.act.concat(this.defaultAct);
        } else {
            option.act.push(this.defaultAct);
        }
    }

    var ReadStream = require('./read_stream.js');
    var readStream = new ReadStream(filePath, {
            encoding: option.encoding
        }, option.act);

    return readStream.getStream();
};

FileSystem.prototype.readFile = function(filePath, option, callback) {
    var buffer;
    var stream;

    if(!callback && _.isFunction(option)) {
        callback = option;
        option = {};
    }

    try {
        stream = this.createReadStream(filePath, option);

        stream.on('error', function(e) {
            callback && callback(e);
        });
        aggre(stream).on('data', function(chunk) {
            buffer = chunk;
        }).on('end', function() {
            callback && callback(null, buffer || new Buffer(0));
        });
    } catch(e) {
        callback && callback(e);
    }
};

FileSystem.prototype.mkdir = function(dir) {
    dir = this.pathResolve(dir);
    mkdirp.sync(dir);
};

FileSystem.prototype.rm = function(dir) {
    dir = this.pathResolve(dir);

    if(dir.indexOf(bone.status.base) == -1) {
        throw new Error('Dangerous behavior! you are use "rm" function without project dir.');
    }

    if(fs.existsSync(dir)) {
        var stat = fs.statSync(dir);
        if(stat.isDirectory()) {
            var contain = fs.readdirSync(dir);
            _.each(contain, function(file) {
                this.rm(this.pathResolve(file, dir));
            }, this);
            fs.rmdirSync(dir);
        } else {
            fs.unlinkSync(dir);
        }
    }
};

FileSystem.prototype.createWriteStream = function(filePath, option) {
    option || (option = {});
    filePath = this.pathResolve(filePath);
    var dir = path.dirname(filePath);
    if(option.focus) {
        this.mkdir(dir);
    } else {
        if(!fs.existsSync(dir)) {
            throw new Error('fail to open '+dir);
        }
    }
    return fs.createWriteStream(filePath, option);
};

FileSystem.prototype.writeFile = function(filePath, content, option) {
    option || (option = {});
    filePath = this.pathResolve(filePath);
    var stream = this.createWriteStream(filePath, option);

    stream.write(content);
    stream.end();
};

FileSystem.prototype.search = function(search, option) {
    option || (option = {});
    search = this.pathResolve(search);
    var result = minimatch.match(Data.virtualFileStack, search, {});

    if(!option.notFs) {
        var real = glob.sync(search);

        result = result.concat(real);
    }
    var self = this;
    result = result.map(function(file) {
        return self.pathResolve(file);
    });
    if(!option.searchAll) {
        var tempFiles = _.clone(Data.virtualTemporaryFile);
        if(result.length) {
            tempFiles.unshift(result);
            result = _.without.apply(_, tempFiles);
        }
    }
    result = _.uniq(result);
    return result;
};

FileSystem.prototype.refresh = function() {
    return FileSystem.refresh();
};

FileSystem.prototype.readDir = function(dirPath) {
    dirPath = this.pathResolve(dirPath);
    var result = this.search(path.join(dirPath, '*'));

    result = result.map(function(file) {
        return path.relative(dirPath, file).split(path.sep).join('/');
    });
    return result;
};

FileSystem.prototype.existFile = function(filePath, option) {
    option || (option = {});

    filePath = this.pathResolve(filePath);
    
    if(filePath in Data.virtualFiles) {
        return true;
    } else {
        if(!option.notFs) {
            filePath = this.pathResolve(filePath);
            if(fs.existsSync(filePath)) {
                var stat = fs.statSync(filePath);

                return stat.isFile();
            }
        }
    }
    return false;
};

/**
 * static
 */
Object.defineProperty(FileSystem, 'fs', {
    configurable: false,
    enumerable: true,
    get: function() {
        if(!this.value) {
            this.value = new FileSystem(bone.status.base);
        }
        return this.value;
    }
});

FileSystem.setTraceTree = function(file, dependencies) {
    var realDependencies = [];
    var raw = dependencies;

    while(raw.length) {
        var checkFile = raw.pop();
        if(Data.virtualFileTraceTree[checkFile]) {
            raw = raw.concat(Data.virtualFileTraceTree[checkFile]);
        } else {
            realDependencies.push(checkFile);
        }
    }

    realDependencies = _.uniq(realDependencies);

    Data.virtualFileTraceTree[file] = realDependencies;
    // 构建反向依赖树
    _.each(realDependencies, function(f) {
        if(!Data.virtualFileTraceTreeB[f]) {
            Data.virtualFileTraceTreeB[f] = [];
        }
        if(_.indexOf(Data.virtualFileTraceTreeB[f], file) == -1) {
            Data.virtualFileTraceTreeB[f].push(file);
        }
    });
};
FileSystem.register = function(file, options) {
    file = this.fs.pathResolve(file);
    if(_.has(Data.virtualFiles, file)) {
        // warn
        throw new Error('Register override:'+file);
    }
    Data.virtualFileStack.push(file);
    Data.virtualFiles[file] = _.extend(options, {dest: file});
    if(options.temp) {
        Data.virtualTemporaryFile.push(file);
    }
};

FileSystem.refresh = function() {
    Data.virtualFiles = {};
    Data.virtualFileStack.length = 0;
    Data.virtualTemporaryFile.length = 0;

    var File = require('./file.js');
    File.setup();
    this.searchStack();
};

FileSystem.searchStack = function() {
    var stack = {};
    var files = _.keys(Data.virtualFiles);
    _.each(files, function(file) {
        stack[file] = true;
        while(true) {
            var dir = path.dirname(file);
            if(stack[dir]) break;
            if(dir == '/') break;
            if(dir == bone.status.base) break;
            stack[dir] = true;
            file = dir;
        }
    }, this);
    Data.virtualFileStack = _.keys(stack);
};

FileSystem.getFs = function(option) {
    if(option) {
        return new FileSystem(bone.status.base, option);
    } else {
        return FileSystem.fs;
    }
};


module.exports = FileSystem;