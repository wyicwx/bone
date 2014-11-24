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

processor也可以不传递参数

```js
bone.dest('dist')
	.src('~/main.js')
	.act(processor);
```
如果你有多个处理，需要调用多次`act()`来传入，处理器将按顺序进行处理

```js
bone.dest('dist')
	.src('~/main.js')
	.act(processorA)
	.act(processorB)
	.act(processorC);
```

处理器B获取到的源文件内容是已经被处理器A所处理后的内容，并不是`~/main.js`的源文件内容，处理器C获取到的是处理器B处理之后的内容，依次类推

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
```

**option**：传递的参数

`this.option.defaults()`接受一个默认值对象返回参数
```js
var scope = {
	option: option || {}
};
scope.option.defaults = function(obj) {
	obj || (obj = {});
	return _.extend(obj, option);
};

```

**source**：指向处理器正在处理的源文件的路径

**argvs**：处理函数的参数

###合并处理器

`bone.wrapper`可以传递多个处理器将其合并成一个，方便调用

```js
var multiProcessor = bone.wrapper(processA, processB, processC);

bone.dest('dist')
	.src('~/main.js')
	.act(multiProcessor);
```