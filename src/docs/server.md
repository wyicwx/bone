# 开发服务器

### 静态资源服务器

静态资源服务器适合静态页面或者单页面应用开发，服务器在本地机器上开启不依赖后端服务器 

`bone-cli-connect`模块提供一个简易的静态服务器，该模块使用[内建api](./inner_api.html)来读取文件，因此可以使用bone的特性

通过npm安装在本地项目中

```sh
$ npm install bone-cli-connect --save-dev
```

在`bonefile.js`文件里通过`bone.cli`函数载入bone-cli-connect模块

```javascript
var bone = require('bone');
var connect = require('bone-cli-connect');

bone.cli(connect({
    base: './dist'
}));
```
通过命令`bone connect`启动静态服务器

#### 可选参数

```javascript
var connect = require('bone-cli-connect');
var options = {
    port: 8000,
    host: '127.0.0.1',
    base: './',
    livereload: false   
};
bone.cli(connect(options));
```

##### port
指定监听的端口号
默认值为：8000

##### host
指定监听的ip
默认值为：0.0.0.0

##### base
指定根目录地址
默认值为：bonefile.js所在文件夹路径

##### livereload
启用[livereload](https://github.com/intesso/connect-livereload)功能
默认值为：false

**注**：也支持修改参数

```sh
$ bone connect --port 8080 --base ./dist
```

### 代理服务器

代理服务器提供类似fiddler的AutoreSponder功能

`bone-cli-proxy`模块提供强大的代理服务器，该模块使用[内建api](./inner_api.html)来读取文件，因此可以使用bone的特性


### 安装及使用

通过npm安装

```sh
$ npm install bone-cli-proxy 
```

安装后在`bonefile.js`文件内通过`bone.cli()`加载

```js
var bone = require('bone');
var proxy = require('bone-cli-proxy');

bone.cli(proxy());
```

### 参数

**port**

type: `number` default: 8080

代理服务器的启用端口

**enableReplace**

type: `boolean` default: true

启用代理替换

**replaceRules**

type: `array` default: []

代理过程中替换文件规则，参数为二维数组，第一个值为正则，第二个值为被替换的文件

```js
var proxy = require('bone-cli-proxy');
bone.cli(proxy{
    replaceRules: [
        [/www\.qq\.com\/([^.]*)/, '~/dist/qq/{$1}']
        [/www\.baidu\.com\/([^.]*)/, '~/dist/baidu/{$1}']
    ]
});

```

**enableLog**

type: `boolean` default: false

启用http访问log

**visitLog**

type: `string`、`stream` default: '~/bone-cli-proxy/visit.log'

访问log写入目的地，可以传入一个可写流

**enableResponseLog**

type: `boolean` default: false

启用http返回log

**responseLog**

type: `string`、`stream` default: '~/bone-cli-proxy/response.log'

返回log写入目的地，可传入一个可写流

**pac**

type: `string`、`boolean` default: false

支持用pac方式的代理，可以填入一个网址或者true，参数为true时只匹配replaceRules内的规则

**pacEncoding**

type: `string` default: 'gbk'

pac文件编码