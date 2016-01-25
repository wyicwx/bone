
# Bone 


> web前端开发工具

<!-- <img src="/bone.png" alt="bone" width="50%"/> -->

[![NPM version](https://img.shields.io/npm/v/bone.svg?style=flat)](https://npmjs.org/package/bone) [![NPM version](https://img.shields.io/npm/dm/bone.svg?style=flat)](https://npmjs.org/package/bone) [![travis](https://api.travis-ci.org/wyicwx/bone.png)](https://travis-ci.org/wyicwx/bone) 
[![Coverage Status](https://coveralls.io/repos/wyicwx/bone/badge.png?branch=master)](https://coveralls.io/r/wyicwx/bone?branch=master) [![Join the chat at https://gitter.im/wyicwx/bone](https://badges.gitter.im/wyicwx/bone.svg)](https://gitter.im/wyicwx/bone?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

###核心概念

　　这个模块是Bone的核心功能，为了让使用者更容易读懂Bone的配置文件，核心模块提供了一种类似操作系统里文件系统的概念，我称它为虚拟文件系统，即将一个虚拟的文件地址映射到一个真实存在的文件地址上，同时可以标注虚拟文件是由何种方式对源文件处理（注意这里不对真实文件做任何处理，源文件是指对真实文件的在内容上的拷贝），对源文件的处理模块我称它为[处理器](https://github.com/wyicwx/bone/blob/master/docs/plugin.md)，通过下面的示例你可以对Bone的虚拟文件系统有一个初步的了解。

###示例