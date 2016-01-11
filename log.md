+ 2016-01-11 v0.3.0
    + 增加watch函数，用来开启对项目文件的监听，废弃bone.helper对象
+ 2016-01-10 v0.2.1
    + dir()函数传递空字符串误判为空bug修复
+ 2016-01-10 v0.2.0
    + 重构流读取模块、act处理模块，代码结构更加清晰，使用新的加载act方式`bone.require`
    + act的runtime通过cacheable函数声明该文件是否可以被缓存
    + act的runtime增加addDependency函数来显示声明所依赖的文件
+ 2015-12-22 v0.1.4
	+ 解决windows下watch没有清理cache的问题
	+ 修改pathResolve针对windows解析根目录的问题
+ 2015-12-12 v0.1.2
	+ FileSystem.getFs增加defaultAct参数，返回的实例在读取文件的接口上默认进行参数指定的处理器处理，增加相应的单元测试
	+ search增加参数searchAll允许搜索临时文件
+ 2015-12-11 release v0.1.0，增加缓存，提升性能，读取文件更快，对前一版本进行大改造，去掉使用频率较少的api，增加一些新的实验性特性
+ 2015-06-30 release v0.0.25，基础功能已经完善的版本
+ 2014-09-17 终止jt项目，提取核心功能重构bone第一版v0.0.1
