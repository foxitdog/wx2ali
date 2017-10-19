var babel = require("babel-core");
var traverse = require("ast-traverse")
var repl = require("repl");
var fs = require("fs");
var ast;
var statements = {
  showToast: {
    title: "content",
    icon: "type"
  }
}
let begin=0;
let end=0;
let contentArray=[];
try {
  let content = fs.readFileSync("Z:\\Program\\workspaces\\wx\\LogisticsCabinetwc\\trunk\\LogisticsCabinetwc\\app.js", "utf8");
  ast = babel.transform(content);
  traverse(ast.ast, {
    pre: function (node, parent, prop, idx) {
      if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && node.arguments[0].type === "ObjectExpression") {

        console.log(node);
        if(node.callee.property.type === "Identifier" && statements[node.callee.property.name]!=undefined){
          let PROP_name=node.callee.property.name;//api的名称
          var PROP=statements[PROP_name];//替换的参数对象
          node.arguments[0].properties.forEach(function(element) {
            // console.log(element)
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
  console.log(contentArray.join(""));
} catch (exception) {
  console.log("Parse Error: " + exception);
}
// repl.start("> ").context.ast = ast;