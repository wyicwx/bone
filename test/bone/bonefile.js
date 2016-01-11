'use strict';
var AKOStream = require('akostream');
var combine = AKOStream.combine;
var aggre = AKOStream.aggre;
var bone = require('../../index.js');

var plugins = {
    author: bone.require('../bone/plugins_author.js'),
    copyright: bone.require('../bone/plugins_copyright.js'),
    dependency: bone.require('../bone/dependency.js'),
    dependencyArray: bone.require('../bone/dependency_array.js'),
    error: bone.require('../bone/callback_error.js'),
    concat: bone.require('bone-act-concat'),
    less: bone.require('bone-act-less'),
};

// define a virtual folder 'dist'
var dist = bone.dest('dist');

// rename
var renameDir = dist.dest('rename');

    renameDir
        .src('~/src/rename/base.js')
        .rename('foo.js');

    renameDir
        .src('~/src/rename/base.js')
        .rename({
            ext: 'jsx'
        });

    renameDir
        .src('~/src/rename/base.js')
        .rename({
            name: 'bar'
        });

    renameDir
        .src('~/src/rename/base.js')
        .rename({
            name: 'bar',
            ext: '.jsx'
        });

    renameDir
        .src('~/src/rename/base.js')
        .rename(function() {
            return 'zoo.js'
        });

// define single file
var singleDir = dist.dest('single');

    singleDir
        .src('~/src/single/foo.js');

    singleDir
        .src('./foo.js')
        .rename('zoo.js');

    bone.dest('dist/single').src('~/src/single/foo.js').rename('bar.js');

// use src() glob
var globDir = dist.dest('glob');
    
    globDir.src('~/src/glob/**/*');

// duplicate definition
var duplicateDefinitionDir = dist.dest('duplicateDefinition');

    duplicateDefinitionDir.src('~/src/duplicateDefinition/foo.js');

// over reference
var overReferencesDir = bone.dest('src/overReferences');
    
    overReferencesDir.src('./foo.js');

// all empty file
var emptyDir = dist.dest('empty');

    emptyDir.src('~/src/empty/*');

// temp dir
var tempDir = dist.dest('temp');

    tempDir
        .temp(true)
        .src('~/src/temp/*.js');

// read dir
var readDirDir = dist.dest('readDir');
    
    readDirDir
        .src('~/src/readDir/*');

    readDirDir
        .src('~/src/readDir/*')
        .rename(function(filename) {
            return filename + '.jsx';
        });

// rependencyFile
var dependencyFileDir = dist.dest('dependencyFile');
    
    dependencyFileDir
        .src('~/src/dependencyFile/foo.js')
        .act(plugins.concat({
            files: [
                '~/src/dependencyFile/dependency_a.js',
                '~/src/dependencyFile/dependency_b.js'
            ]
        }))
        .rename('dependency.js');

    dependencyFileDir
        .src('~/src/dependencyFile/foo.js')
        .act(plugins.concat({
            files: [
                '~/src/dependencyFile/dependency_a.js',
                '~/src/dependencyFile/dependency_b.js',
                '~/src/dependencyFile/dependency_c.js'
            ]
        }))
        .rename('dependency_2.js');

    dependencyFileDir
        .src('./dependency.js')
        .act(plugins.concat({
            files: [
                '~/src/dependencyFile/dependency_c.js'
            ]
        }))
        .rename('dependency_3.js');

// deleteFile dir
var deleteFileDir = dist.dest('deleteFile');
    
    deleteFileDir
        .src('~/src/deleteFile/foo.js')
        .act(plugins.concat({
            files: [
                '~/src/deleteFile/concat/*.js'
            ]
        }));

// cwd dir
var cwdDir = dist.dest('cwd');

    cwdDir
        .cwd('~/src/cwd')
        .src('./**/*');

// change dir
var changeDir = dist.dest('change');
    
    changeDir
        .src('~/src/change/change.js');

// plugins dir
var pluginsDir = dist.dest('plugins').cwd('~/src/plugins');

    pluginsDir 
        .src('~/src/plugins/foo.js')
        .act(plugins.author)
        .rename('author_not_parameter.js');

    pluginsDir
        .src('~/src/plugins/foo.js')
        .act(plugins.copyright())
        .rename('copyright.js');

    pluginsDir
        .src('~/src/plugins/foo.js')
        .act(plugins.author({
            author: 'wyicwx'
        }))
        .act(plugins.copyright({
            copyright: 'wyicwx'
        }))
        .rename('author_copyright.js');

    pluginsDir
        .src('~/src/plugins/foo.js')
        .act(plugins.author({
            author: 'wyicwx'
        }))
        .rename('author.js');

    pluginsDir
        .src('~/src/plugins/foo.js')
        .act(plugins.dependency)
        .rename('addDependency.js');

    pluginsDir
        .src('~/src/plugins/foo.js')
        .act(plugins.dependencyArray)
        .rename('addDependencyArray.js');

    pluginsDir
        .src('./foo.js')
        .act(plugins.error)
        .rename('error.js');

// track dir
var trackDir = dist.dest('track');

    trackDir
        .src('~/dist/single/zoo.js')
        .rename('bar.js');

    trackDir
        .src('~/dist/single/foo.js');

var lessDir = dist.dest('less');

    lessDir
        .src('~/src/less/style.less')
        .act(plugins.less)
        .rename('style.css');

    lessDir
        .src('~/src/less/style.less')
        .act(plugins.less({}, {
            filter: {
                name: 'less'
            }
        }))
        .rename('notCompile.js')

var dirDir = dist.dest('dir');

    dirDir
        .src('~/src/dir/foo.js')
        .dir('string');

    dirDir
        .src('~/src/dir/foo.js')
        .dir(function(dir, source, destination) {
            return 'function';
        });

    dirDir
        .src('~/src/dir/**/*.js')
        .dir('');


// dev.dest('track')
//     .src('~/dev/js/*');

// dev.dest('trackRename')
//     .src('../track/hello.js')
//     .rename('foo.js');

// define over reference file
// dist.dest('js')
//     .src('./hello.js')
//     .rename('a.js');
// dist.dest('js')
//     .src('./a.js')
//     .rename('b.js');



// map dist
// var cdist = bone.dest('cdist');
// cdist.src('~/dist/**/*')
//     .act(plugins.less);

// define a virtual folder 'dev' 
// var dev = bone.dest('dev');
// map ~/src/js/*.js to dev
// dev.dest('js')
//     .src('~/src/js/*.js');
// map ~/src/css/css.css to dev/css.css
// bone.dest('dev').src('~/src/css/css.css');
// define ~/dev/js/hello.js pass through author() processor
// dev.dest('js')
//     .src('./hello.js')
//     .act(plugins.author({
//         author: 'wyicwx'
//     }))
//     .rename('hello_sign.js');
// define ~/dev/js/hello.js pass through author() and copyright() processor
// dev.dest('js')
//     .src('./hello.js')
//     .act(plugins.author({
//         author: 'wyicwx'
//     }))
//     .act(plugins.copyright({
//         copyright: 'wyicwx'
//     }))
//     .rename('hello_sign_copyright.js');

// define ~/dev/js/hello.js pass through copyright() processor
// dev.dest('js')
//     .src('./hello.js')
//     .act(plugins.copyright())
//     .rename('hello_copyright_default.js');

// dev.dest('js')
//     .src('./hello.js')
//     .act(plugins.author)
//     .rename('hello_sign-noparam.js');

// dev.dest('track')
//     .src('~/dev/js/*');

// dev.dest('trackRename')
//     .src('../track/hello.js')
//     .rename('foo.js');

// dev.dest('dependentFile')
//     .src('~/dev/js/hello.js')
//     .act(plugins.concat({
//         files: [
//             '~/src/project/file1.js',
//             '~/dev/css.css'
//         ]
//     }));

// dev.dest('dependentFile')
//     .src('~/dev/js/hello.js')
//     .act(plugins.concat({
//         files: [
//             '~/src/project/file2.js',
//             '~/src/project/file3.js',
//             '~/dev/css.css'
//         ]
//     }))
//     .rename('foo.js');

// dev.dest('dependentFile')
//     .src('~/dev/js/hello.js')
//     .act(plugins.concat({
//         files: [
//             '~/src/js/*.js'
//         ]
//     }))
//     .rename('concatGlob.js');

// dev.dest('change')
//     .src('~/src/js/change.js');

// dev.dest('change')
//     .src('~/src/js/added.js');

// bone.dest('cwd/all')
//     .cwd('~/src')
//     .src('./**/*');

// bone.dest('cwd/js')
//     .cwd('~/src')
//     .src('./js/**/*');

// bone.dest('cwd/folder')
//     .cwd('~/src')
//     .src('js/hello.js');

// define a virtual folder 'search' for test search()
// bone.dest('search')
//     .src('~/src/**/*');

// bone.dest('notExist')
//     .src('./*/notExist.js');