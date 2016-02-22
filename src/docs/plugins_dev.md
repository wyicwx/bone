# 处理器开发

如果已有的处理器无法满足需求，你可以通过这篇文章定制化自己的处理器

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

    });

    // do something...

    callback(null, buffer);
});
```

#### cacheable():

#### addDependency():







