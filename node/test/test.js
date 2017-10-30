var htmlparser = require("htmlparser");
// var htmlparser = require("htmlparser2");
var jsonxml = require('jsontoxml');
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
  let content = fs.readFileSync("Z:\\Program\\workspaces\\wx\\LogisticsCabinetwc\\trunk\\LogisticsCabinetwc\\page\\main\\main.axml", "utf8");
  var handler = new htmlparser.DefaultHandler(function (error, dom) {
    if (error)
      console.log(error);
    // else
      // console.log(dom)
  });
  var parser = new htmlparser.Parser(handler);
  parser.parseComplete(content);
  // sys.puts(sys.inspect(handler.dom, false, null));
  console.log(jsonxml(handler.dom))
  console.log(handler.dom)
} catch (exception) {
  console.log("Parse Error: " + exception);
}
repl.start("> ").context.dom = handler.dom;