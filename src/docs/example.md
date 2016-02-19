# 简易示例

这里提供了一个`bonefile.js`文件的示例

```javascript
var bone = require('bone'); 
var less = bone.require('bone-act-less');

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
    .rename({
        extTransport: {
            ".less": ".css"
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
这个示例依赖下面这些依赖，使用npm单独安装

+ [bone-act-less](https://github.com/wyicwx/bone-act-less)
+ [bone-cli-build](https://github.com/wyicwx/bone-cli-build)
+ [bone-cli-connect](https://github.com/wyicwx/bone-cli-connect)

配置文件里，bone模块需要单独引用

```javascript
var bone = require('bone');
```
