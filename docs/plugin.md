#处理器

处理器是针对单一文件内容进行编辑修改的函数，在bone的文件映射过程中通过处理器来对源文件的内容进行修改

###调用方式
存在一个名为processor的处理器，通过`act()`将处理器传入
```js
var option = {};

bone.dest('dist')
	.src('~/main.js')
	.act(processor(option));
```
processor

###定义你自己的处理器
```js
var processor = bone.wrapper(function(buffer, encoding, callback) {
	var option = this.option.defaults({
		split: '~',
		join: ','
	});
	var content = buffer.toString(encoding);
	
	content = content.split(option.split)
					 .join(opiton.join);

	callback(null, content);
});
```
this指向了这个处理器的runtime，通过this可以获得正在处理的源文件的相关信息
```js
var processor = bone.wrapper(function(buffer, encoding, callback) {
	console.log(this);
	// return
	/*
	{
		source: 'file full path',
		option: { 
			defaults: [Function] 
		},
		argvs: {
			buffer: <Buffer>,
			encoding: 'buffer',
			callback: [Function]
		}
	}
	*/

	callback(null, buffer);
});

###合并处理器