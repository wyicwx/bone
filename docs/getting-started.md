1. 通过npm安装bone到你的项目中

	npm install bone --save-dev

2. 创建`bonefile.js`
	
	var bone = require('bone');

3. 通过`dest()`定义你的虚拟文件

	bone.dest('dist')
		.src('~/src/**/*');

