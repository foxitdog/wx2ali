#!/usr/bin/env node
let fs = require("fs");
let path = require("path");
let readline = require('linebyline');
let arg = process.argv;
let dir = path.dirname(arg[1]);
let configpath = path.resolve(dir, "wx2ali.txt");
let dirPath="";
if(arg[2]){
    if(arg[2]==="--start"){

    }else if(arg[2]==="--getConfig"){
        console.log("配置路径："+configpath);
        console.log("记得修改工作目录后保存配置 并且备份需要进行的转换工程");
        return;
    }else if(arg[2]==="--path"){
        if(arg[3]){
            try {
                fs.accessSync(arg[3]);
                dirPath=arg[3];
            } catch (error) {
                if(error.code==="ENOENT"){
                    console.log("没有该文件或目录"+arg[3]);
                }else{
                    console.log(error);
                }
                return ;
            }
        }else{
            console.log("请输入工作目录 如：wx2ali --path 'c:\\ab'");
            return ;
        }
    }
    else{
        console.log("你可以输入wx2ali --getConfig 获取配置文件路径 然后修改配置文件");
        console.log("你可以输入wx2ali --path <path路径> 以输入的path为工作路径开始转换");
        console.log("你可以输入wx2ali --start开始转换(以配置中的路径为工作目录)");
        return;
    }
}else{
    console.log("你可以输入wx2ali --getConfig 获取配置文件路径 然后修改配置文件");
    console.log("你可以输入wx2ali --path <path路径> 以输入的path为工作路径开始转换");
    console.log("你可以输入wx2ali --start开始转换(以配置中的路径为工作目录)");
    return;
}
let rl = readline(configpath);
let JSAPR=require("./lib/JSApiPropReplace.js")
let Order = 0;
/**
 * 将符合后缀的文件copy和修改后缀名为指定的后缀。e.g.
 * addUpdateSuffix(".wxml",".axml");将会copy指定目录下所有的.wxml后缀的文件为.axml后缀的文件
 */
const UPDATAANDCOPY = 1;
/**
 * 删除指定后缀的文件 e.g. addUpdateSuffix("abc.xml")将会删除指定目录下所有的abc.xml
 */
const DELETEFILE = 2;
/**
 * 将符合后缀的文件替换为指定的后缀 e.g.
 * addUpdateSuffix(".wxml",".axml");将会修改指定目录下所有的.wxml为.axml
 */
const UPDATESUFFIX = 3;
/**
 * 微信小程序转阿里小程序 js文件主要是进行库名的修改，即'wx.'-->'my.' 方法名替换使用addUpdateMethods()添加更换的方法
 * e.g. addUpdateMethods("request","httpRequest") 将request转换成httpRequest
 * axml文件主要进行 属性名称的修改，即'wx:'-->'a:'
 */
const WX2ANT = 4;
const config = {
    dir: "",
    suffix: [],
    toSuffix: [],
    methods: [],
    toMethods: [],
    JSRegexp: [],
    JSToRegexp: [],
    AXMLRegexp: [],
    AXMLToRegexp: [],
	JSONRegexp:[],
    JSONToRegexp:[],
	ACSSRegexp:[],
    ACSSToRegexp:[],
    JSApiPropReplace:{}
};
let state = "";
let jsaprstate="";
// let jsaprprop="";
rl
    .on('line', function (line, lineCount, byteCount) {
        line=line.replace(/#.*$/g, "").trim();
        if (state === "") {
            if ("JSmethod" === line) {
                state = line
            } else if ("JS" === line) {
                state = line
            } else if ("AXML" === line) {
                state = line
            } else if ("ACSS" === line) {
                state = line
            } else if ("DIR" === line) {
                state = line
            } else if ("JSON" === line) {
            	state = line
            } else if ("JS_API_PROP_REPLACE" === line) {
            	state = line
            } else if("OVER"===line){
                main();
            }
        } else if ("end" === line) {
            state = "";
        } else if ("" === line) {
        } else if ("JSmethod" === state) {
            let aTob = line.split("--->");
            addUpdateMethods(aTob[0], aTob[1]);
        } else if ("JS" === state) {
            let aTob = line.split("--->");
            addJSRegexp(aTob[0], aTob[1]);
        } else if ("AXML" === state) {
            let aTob = line.split("--->");
            addAXMLRegexp(aTob[0], aTob[1]);
        } else if ("ACSS" === state) {
            let aTob = line.split("--->");
            addACSSRegexp(aTob[0], aTob[1]);
        } else if ("JSON" === state) {
            let aTob = line.split("--->");
            addJSONRegexp(aTob[0], aTob[1]);
        } else if ("JS_API_PROP_REPLACE" === state) {
            addToJSApiPropReplace(line)
        } else if ("DIR" === state) {
            config.dir = dirPath||line;
            console.log("切换到修改文件路径：" + line);
        } else if("OVER"===line){
            main();
        }
    })
    .on('error', function (e) {
        console.log(e);
    });
function main(){
    // console.log(config.JSApiPropReplace)
    addUpdateSuffix("wxml", "axml");// 这边的order是UPDATESUFFIX 所以是修改后缀名 wxml->axml
    addUpdateSuffix("wxss", "acss");// wxss->acss
    setOrder(UPDATESUFFIX);
    HandleFile(config.dir);
    clearSuffix();
    setOrder(WX2ANT);
    HandleFile(config.dir);
    console.log("*****************************************************************************")
    console.log("转换完成");
    console.log("*****************************************************************************")
}
function setOrder(order) {
    Order = order;
}
function addUpdateMethods(method, toMethod) {
    config.methods.push(method);
    config.toMethods.push(toMethod || "");
}

function clearMethod() {
    config.methods = [];
    config.toMethods = [];
}

// ----------------------------------- 要更新的后缀

function addUpdateSuffix(suffix, toSuffix) {
    config.suffix.push(suffix);
    config.toSuffix.push(toSuffix || "");
}

function clearSuffix() {
    config.suffix = [];
    config.toSuffix = [];
}

// ----------------------------------- js要更新的正则表达式

function addJSRegexp(suffix, toSuffix) {
    config.JSRegexp.push(suffix);
    config.JSToRegexp.push(toSuffix || "");
}

function clearJSRegexp() {
    config.JSRegexp = [];
    config.JSToRegexp = [];
}

// ----------------------------------- amxl要更新的正则表达式
function addAXMLRegexp(suffix, toSuffix) {
    config.AXMLRegexp.push(suffix);
    config.AXMLToRegexp.push(toSuffix);
}

function clearAXMLRegexp() {
    config.AXMLRegexp = [];
    config.AXMLToRegexp = [];
}

// ----------------------------------- acss要更新的正则表达式
function addACSSRegexp(suffix, toSuffix) {
    config.ACSSRegexp.push(suffix);
    config.ACSSToRegexp.push(toSuffix);
}

function clearACSSRegexp() {
    config.ACSSRegexp = [];
    config.ACSSToRegexp = [];
}

//----------------------------------- json要更新的正则表达式
function addJSONRegexp(suffix, toSuffix) {
    config.JSONRegexp.push(suffix);
    config.JSONToRegexp.push(toSuffix);
}

function clearJSONRegexp() {
    config.JSONRegexp = [];
    config.JSONToRegexp = [];
}
//----------------------------------- JSApiPropReplace
function addToJSApiPropReplace(str) {
    if(str==="PRO:"){
        jsaprstate="";
    }else if(str==="KEYS:"){

    }else if(str.startsWith("KEYS:")&&jsaprstate!==""){
        str=str.substring(5).trim()
        let aTob = str.split("--->");
        config.JSApiPropReplace[jsaprstate][aTob[0]]=aTob[1]
    }else if(str.startsWith("PRO:")){
        str=str.substring(4).trim()
        jsaprstate=str;
        config.JSApiPropReplace[jsaprstate]={};
    }else if(jsaprstate===""){
        jsaprstate=str;
        config.JSApiPropReplace[jsaprstate]={};
    }else if(jsaprstate!==""){
        let aTob = str.split("--->");
        config.JSApiPropReplace[jsaprstate][aTob[0]]=aTob[1]
    }
}

// function clearJSONRegexp() {
//     config.JSONRegexp = [];
//     config.JSONToRegexp = [];
// }
// -----------------------------------
function HandleFile(file) {
  
    try {
        fs.accessSync(file)
        let stat = fs.statSync(file);
        if (stat.isFile()) {
            switch (Order) {
                case UPDATAANDCOPY:
                    updataAndCopy(file);
                    break;
                case DELETEFILE:
                    deleteFile(file);
                    break;
                case UPDATESUFFIX:
                    updataSuffix(file);
                    break;
                case WX2ANT:
                    wx2ant(file);
                    break;
                default:
                    console.log("没有该种处理文件的方式");
                    break;
            }
        } else if (stat.isDirectory()) {
            let dirs = fs.readdirSync(file);
            for (let i in dirs) {
                HandleFile(path.resolve(file, dirs[i]));
            }
        }
    } catch (e) {
        console.log(e)
    }
}


/**
 * 将符合后缀的文件copy和修改后缀名为指定的后缀。e.g.
 * addUpdateSuffix(".wxml",".axml");将会copy指定目录下所有的.wxml后缀的文件为.axml后缀的文件
 * 
 * @param f
 */
function updataAndCopy(file) {
    let index = isValid(file);
    if (index == -1) {
        return;
    }
    let suffix = config.suffix;
    let toSuffix = config.toSuffix;
    let newfile = file.replace(new RegExp(suffix[index] + "$"), toSuffix[index]);
    try {
        fs.copyFileSync(file, newfile);
        console.log("文件复制：" + newfile);
    } catch (e) {
        console.log(e)
        console.log("文件复制出错：" + e.getMessage());
    }
}

/**
 * 将符合后缀的文件替换为指定的后缀 e.g.
 * addUpdateSuffix(".wxml",".axml");将会修改指定目录下所有的.wxml为.axml
 * 
 * @param f
 */
function updataSuffix(file) {
    let index = isValid(file);
    if (index == -1) {
        return;
    }
    let suffix = config.suffix;
    let toSuffix = config.toSuffix;
    let newfile = file.replace(new RegExp(suffix[index] + "$"), toSuffix[index]);
    try {
        fs.renameSync(file, newfile);
        console.log("文件修改后缀名：" + newfile);
    } catch (e) {
        console.log(e)
        console.log("文件修改后缀名出错：" + newfile + "--" + e.getMessage());
    }
}

/**
 * 删除指定后缀的文件 e.g. addUpdateSuffix("abc.xml")将会删除指定目录下所有的abc.xml
 * 
 * @param f
 */
function deleteFile(file) {
    try {
        fs.accessSync(file);
        fs.unlinkSync(file);
        console.log("文件删除成功:" + path);
    } catch (e) {
        console.log(e);
        console.log(file + "文件有误");
    }
}

/**
 * 微信小程序转阿里小程序 js文件主要是进行库名的修改，即'wx.'-->'my.' 方法名替换使用addUpdateMethods()添加更换的方法
 * e.g. addUpdateMethods("request","httpRequest") 将request转换成httpRequest
 * axml文件主要进行 属性名称的修改，即'wx:'-->'a:'
 * 
 * @param f
 */
function wx2ant(file) {
    if (path.extname(file) === ".js") {
        let preffix = "(^|\\W+)wx\\.";
        let toPreffix = "$1my.";
        let methods = config.methods;
        let toMethods = config.toMethods;
        let JSRegexp = config.JSRegexp;
        let JSToRegexp = config.JSToRegexp;
        try {
            let content = fs.readFileSync(file, "utf8");
            for (let i in methods) {// 修改不一样的方法
                content = content.replace(new RegExp(preffix + methods[i], "g"), toPreffix + toMethods[i]);
            }
            for (let i in JSRegexp) {// 修改不一样的方法
                content = content.replace(new RegExp(JSRegexp[i], "g"), JSToRegexp[i]);
            }
            content = content.replace(new RegExp(preffix, "g"), toPreffix);// 统一修改未进行方法替换的前缀
            content=JSAPR.replace(content,config.JSApiPropReplace);
            fs.writeFileSync(file, content);
            console.log("转换js文件：" + file);
        } catch (e) {
            console.log(e)
            console.log("转换js文件出错：" + file);
        }
    } else if (path.extname(file) === ".axml") {
        let AXMLRegexp = config.AXMLRegexp;
        let AXMLToRegexp = config.AXMLToRegexp;
        try {
            let content = fs.readFileSync(file, "utf8");
            for (let i in AXMLRegexp) {// 修改不一样的方法
                content = content.replace(new RegExp(AXMLRegexp[i], "g"), AXMLToRegexp[i]);
            }
            fs.writeFileSync(file, content);
            console.log("转换axml文件：" + file);
        } catch (e) {
            console.log(e)
            console.log("转换axml文件出错：" + file);
        }
    } else if (path.extname(file) === ".json") {
        let JSONRegexp = config.JSONRegexp;
        let JSONToRegexp = config.JSONToRegexp;
        try {
            let content = fs.readFileSync(file, "utf8");
            for (let i in JSONRegexp) {// 修改不一样的方法
                content = content.replace(new RegExp(JSONRegexp[i], "g"), JSONToRegexp[i]);
            }
            fs.writeFileSync(file, content);
            console.log("转换json文件：" + file);
        } catch (e) {
            console.log(e)
            console.log("转换json文件出错：" + file);
        }
    }else if (path.extname(file) === ".acss") {
        let ACSSRegexp = config.ACSSRegexp;
        let ACSSToRegexp = config.ACSSToRegexp;
        try {
            let content = fs.readFileSync(file, "utf8");
            for (let i in ACSSRegexp) {// 修改不一样的方法
                content = content.replace(new RegExp(ACSSRegexp[i], "g"), ACSSToRegexp[i]);
            }
            fs.writeFileSync(file, content);
            console.log("转换acss文件：" + file);
        } catch (e) {
            console.log(e)
            console.log("转换acss文件出错：" + file);
        }
    }
}

function isValid(file) {
    let suffix = config.suffix
    for (let i in suffix) {
        if (file.endsWith(suffix[i])) {
            return i;
        }
    }
    return -1;
}