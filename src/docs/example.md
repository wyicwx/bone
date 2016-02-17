# 简易示例

```javascript
var bone = require('bone'); 
// less处理器
var less = bone.require('bone-act-less');
// 定义文件夹dist
bone.dest("dist")
    .cwd("~/src")
    .src("./**/*")
    .act(less({
        ieCompat: false
    }, {
        filter: {
            ext: ".less"
        }
    }))
    .rename(function(fileName) {
        var path = require('path');

        if (path.extname(fileName) == '.less') {
            return fileName.replace(/\.less$/, '.css');
        } else {
            return fileName;
        }
    });

// build
var build = require('bone-cli-build');
// 加载build命令
bone.cli(build());

// connect本地静态文件服务器
var connect = require('bone-cli-connect');
// 加载connect命令
bone.cli(connect({
    base: "./dist",
    livereload: true
}));

```

