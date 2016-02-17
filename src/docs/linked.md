# 调用任务流

bone的任务流和`Grunt`、`Gulp`的任务流概念是相同的，通过定义一个个的基本的任务单元，再串联起来调用，唯一的区别的是bone的任务流提供调用系统命令的能力。

一个项目往往会有各种各样的辅助脚本，如开发调试、优化压缩、打包部署、在线debug等，不同的脚本可能使用不同的语言实现，也有不同的调用方式，bone提供了一种比较开放的方式能将所有的脚本整合在一起。

`bone-cli`模块提供了`bone.task`函数实现任务流来处理事物，先看看一个例子

```javascript
var bone = require("bone");

bone.task("step1", function() {
    // do something
});
```

一个基本的任务单元由两部分组成，任务名称和处理单元，处理单元可以是字符串、对象、函数，上面的代码中的`step1`任务对应的处理单元是函数。

要执行这个任务，通过`bone 任务名`的方式执行这个任务

```sh
$ bone step1
```

有了一个基本的任务step1，我们继续定义其他的任务，并将任务

```javascript
var bone = require('bone');

bone.task("step1", function() {
    // do something
});

bone.task("step2", function() {
    // do something
});

bone.task("task", "step1", "step2");
```

