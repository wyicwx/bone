#定义一个文件

通过`bone.dest()`来指定一个目的文件夹

**ps**：目的文件夹并不是文件最终路径而是目的文件夹

```js
// 定义一个目的文件夹dist
var dist = bone.dest('dist');
```
通过调用`dist.src()`可以指定源文件
```js
// 指定单一文件
dist.src('~/src/main.js');
// 指定glob匹配规则
dist.src('~/src/*.js');
// 指定多个文件
dist.src([
	'~/src/main.js',
	'~/src/lib/jquery.js',
	'~/src/page/*.js'
]);
```
假设我们的目录结构是这样的
```sh
┬root
└┬ src
 ├── main.js
 ├─┬ lib
 │ ├── undescore.js
 │ ├── jquery.js
 │ └── backbone.js
 └─┬ page
   ├── index.js
   └── detail.js
```
通过上面的代码我们定义了一个dist文件夹，于是我们的目录结构变成这样，当然这个dist在你的文件系统里并不存在，dist仅仅是存在配置文件里
```sh
┬root
├┬dist (virtual folder)
│├── main.js
│├── jquery.js
│├── index.js
│└── detail.js
│
└┬ src
 ├── main.js
 ├─┬ lib
 │ ├── undescore.js
 │ ├── jquery.js
 │ └── backbone.js
 └─┬ page
   ├── index.js
   └── detail.js
```
通过src指定的文件都被映射到了dist文件夹下，这里可能会有疑问，为什么源文件在不同的目录层级下映射之后却都在dist下？

是因为通过src明确指定文件或者glob语法明确匹配文件都只映射文件本身而不映射文件夹，如果需要同时映射文件夹层级的话，一种方法是可以通过再指定目的文件夹来映射
```js
bone.dest('dist')
	.dest('lib')
	.src('~/src/lib/jquery.js');

dist.dest('dist/page');
	.src('~/src/page/*.js');
```
或者通过glob匹配文件夹
```js
dist.src('~/src/main.js');
dist.src([
	'~/src/lib*/jquery.js',
	'~/src/page*/*.js'
]);
```
###通过`cwd()`改变映射文件夹目录
```js
dist.cwd('~/src')
	.src('lib/jquery.js');
```

调用cwd()函数指明源文件的相对文件夹，cwd()调用后再通过src指定的源文件在cwd之下会将cwd目录下的子目录一同映射过去。

###重命名
映射的文件是一一对应的，包括文件名都是相同的，`rename()`提供了重命名的方法

```js
dist.src([
	'~/src/main.js',
	'~/src/lib/jquery.js',
	'~/src/page/*.js'
]).rename(function(filename) {
	return 'dist-'+filename;
});
```
通过给`rename()`传递函数来批量重命名文件
```js
dist.src('~/src/main.js')
	.rename('dist-main.js');
```
也可以仅传递一个字符串来重命名

**ps**：`rename()`必须在调用过`src()`后执行，否则会报错

###处理器


```js
var option = {};
var processor = require('some-act-processor');

bone.dest('dist')
    .src('~/main.js')
    .act(processor(option));
```

`act()`提供处理器的传入，具体请看如何使用并开发自定义[处理器](https://github.com/wyicwx/bone/blob/master/docs/plugin.md)