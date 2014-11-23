#处理器

处理器是针对单一文件内容进行编辑修改的函数，在bone的文件映射过程中通过处理器来对源文件的内容进行修改

###调用方式
假设已经定义了一个processor的处理器，通过`act()`将处理器传入
```js
var option = {};

bone.dest('dist')
	.src('~/main.js')
	.act(processor(option));
```
###定义你自己的处理器

```js
var processor = bone.wrapper(function(buffer, encoding, callback) {
	
});
```