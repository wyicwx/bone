# 处理器开发

如果已有的处理器无法满足需求，你可以通过这篇文章定制化自己的处理器

在bone
假设我们需要替换文件内容

```javascript
var bone = require("bone");

var copyRightAct = bone.wrapper(function(buffer, encoding, callback) {
    var content = buffer.toString();

    content = "";

    this.cacheable();

    callback(null, content);
});
```

执行函数内`this`指向runtime对象，runtime对象保存了处理器所处理的文件信息并提供了相关函数

```javascript
bone.wrapper(function(buffer, encoding, callback) {
    console.log(this);
    /*
    {
        source: '/path/to/source/file.js',
        sourceParsed: { // path.parse('/path/to/source/file')
            root: '/',
            dir: '/path/to/source',
            base: 'file.js',
            ext: '.js',
            name: 'file'
        },
        destination: '/path/to/destination/file.js',
        destinationParsed: {...}, // path.parse('/path/to/destination/file'),
        bone: {...}, // bone对象
        fs: {...}, // bone提供的fs对象
        options: function() {...},
        cacheable: function() {...},
        addDependency: function() {...}
    }
     */
    
    callback(null, buffer);    
});
```

runtime中，`source`对应act所处理的文件的映射来源，`destination`是映射文件的目标路径

#### options():

参数：Object

函数返回调用act传入的参数

```javascript
var act = bone.wrapper(function(buffer, encoding, callback) {
    var option = this.options({
        foo: true,
        zoo: 0
    });

    console.log(option);
    /* 
        {
            foo: true,
            bar: true,
            zoo: 100
        } 
     */
});

bone.dest('js')
    .src('~/src/bar.ja')
    .act(act({
        bar: true,
        zoo: 100
    }));

```

#### cacheable()

cacheable用来设置该处理器处理后的内容是否可以被缓存

```javascript
bone.wrapper(function(buffer, encoding, callback) {
    this.cacheable(); // 设置为可被缓存
    // ...
});
```

当一个虚拟文件有多个处理器的时候，需要所有处理器都设置为可被缓存该虚拟文件才会被缓存，否则不缓存

#### addDependency()

在处理器中使用fs读取文件时，自动将所读取的文件记录为该处理文件的依赖文件

```javascript
bone.wrapper(function(buffer, encoding, callback) {
    this.fs.readFile('~/foo.js'); // 在该处理器内读取了~/foo.js文件，则自动将~/foo.js记录为依赖文件
    // ...
});
```

当模块在使用fs的接口之外需要依赖其他文件，使用addDependency单独添加依赖文件
```javascript
bone.wrapper(function(buffer, encoding, callback) {
    this.addDependency('~/bar.js'); 
    // ...
});
```

### 包装成处理器模块

使用bone.require()方法来引用

```javascript
module.exports.act = function(buffer, encoding, callback) {

};

module.exports.filter = {};
```