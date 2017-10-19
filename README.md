# 微信小程序转支付宝小程序 #
## node版本 ##
### 环境配置： ###
	node.js
### 安装 ###
	npm i wx2ali -g
### 使用 ###
1. 	复制微信小程序的源码一份；
1. 	根据自己需要修改node_module下的wx2ali\wx2ali.txt配置，
1. 	来进行修改工作目录
1. 	之后，命令行直接输入:wx2ali
1. 	等待处理完成。
## java版本 ##
java现在没有打算出1.1.1版本 所以建议是用node环境
### 环境配置： ###
	jre 1.7-64
### 使用方法： ###
1. 安装指定jre 1.7-64环境；
1. 	下载runfile文件夹；
1. 	复制微信小程序的源码一份；
1. 	在使用前可以根据自己需要修改wx2ali.txt配置，
1. 	来进行修改工作目录；
1. 	然后 双击translation.bat；
1. 	文件就会修改完成；

	
## 文件: ##
	runfile
	  --wx2ali.jar //程序包
	  --wx2ali.txt //配置
	  --translation.bat //启动文件
	src	//源码
	node
	  --wx2ali.txt //配置
 	  --package.json
	  --index.js //源码
 	  lib
        --JSApiPropReplace.js //api属性替换
	lib 
	  --commons-io-1.3.2.jar
[点击进入github](https://github.com/foxitdog/wx2ali "wx2ali转换")
	  
## 更新: ##
	v1.1.2
		wx2ali.txt规则增加
		js文件的转换更为彻底
		待完成的工作：
			axml文件的转换
	------------------------
	v1.1.1
		添加js文件api中的差异转换
	------------------------
	v1.0.2
		添加json文件转换
		添加js文件简单转换
		添加axml文件简单的转换
	
有问题可以联系895423140@qq.com 或者提交issue。
	
