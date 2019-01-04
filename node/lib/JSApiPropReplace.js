let babel = require("babel-core");
let traverse = require("ast-traverse")
let fs = require("fs");
let path = require("path");
let pluginpath=path.resolve(__dirname, "../node_modules/babel-plugin-transform-object-rest-spread")
module.exports.replace=function(content,config){
    let ast;
    let begin=0;
    let end=0;
    let contentArray=[];
    try {
      ast = babel.transform(content, {
        plugins: [pluginpath]
      });
      traverse(ast.ast, {
        pre: function (node, parent, prop, idx) {
          if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && node.arguments[0]!=undefined&& node.arguments[0].type === "ObjectExpression") {
            if(node.callee.property.type === "Identifier" && config[node.callee.property.name]!=undefined){
              let PROP_name=node.callee.property.name;//api的名称
              let PROP=config[PROP_name];//替换的参数对象
              node.arguments[0].properties.forEach(function(element) {
                if(PROP[element.key.name]!=undefined){
                  end=element.key.start;
                  let head=content.substring(begin,end);//element.key.start
                  begin=element.key.end;
                  contentArray.push(head,PROP[element.key.name]);
                }
              });
            }
          }
        }
      });
      let head=content.substring(begin);//element.key.start
      contentArray.push(head);
      return contentArray.join("");
    } catch (exception) {
      console.log("Parse Error: " + exception.stack);
    //   console.log(content)
     return content;
    }
}