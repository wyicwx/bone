# 常用示例

```js
var bone = require('bone');
var connect = require('bone-cli-connect');
var less = bone.require('bone-act-less');
var include = bone.require('bone-act-include');
var path = require('path');

bone.dest('dist')
    .src('~/src/**/*')
    .act(include)
    .act(less({
        ieCompat: false
    }))
    .rename(function(fileName) {
        if (path.extname(fileName) == '.less') {
            return fileName.replace(/\.less$/, '.css');
        } else {
            return fileName;
        }
    });

bone.cli(require('bone-cli-build')());

bone.cli(connect({
    base: "./dist",
    livereload: true
}));

```