#定义一个文件

通过`bone.dest()`来指定一个目的文件夹（目的文件夹并不是文件最终路径而是目的文件夹）
```js
// 定义一个目的文件夹dist
var dist = bone.dest('dist');
```
通过调用`dist.src()`可以指定