/**
 * 1.通过遍历html字符串利用正则匹配开始、文本、结束标签
 * 2.每匹配一个字符串就将解析的结果通过ast处理函数处理为ast树形结构
 * 3.每解析完一个标签，在html字符串中删除
 * 4.ast属性结构的函数处理
 *    通过栈的方式储存父节点，父节点始终在栈的最底层
 */


const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
//匹配的分组时标签名
const startTagopen = new RegExp(`^<${qnameCapture}`);
//结束标签</XXX>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
//第一组匹配key value匹配 分组3、4、5
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagclose = /^\s*(\/?)>/;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配的 {{XXX}} 表达式

// 边解析边删除已解析的模板
function parseHTML(html) {
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = []; //用来放元素
  let currentParent; // 指向栈中的最后一个
  let root;

  // 其中的一个节点
function createASTElement(tag, attrs) {
  return {
    tag,
    type: ELEMENT_TYPE,
    children:[],
    attrs,
    parent:null
  }
}

  // 最终转换为抽象语法树
  function start (tag, attrs){
    let node =  createASTElement(tag, attrs);
    if(!root){ //判断是否为根节点
      root = node;
    }
    if(currentParent){
      // 储存当前节点的父元素，并将节点push进父元素的子栈
      node.parent = currentParent;
      currentParent.children.push(node);
    }
    stack.push(node); 
    currentParent = node; // 栈中的最后一个
  }
  function chars (text){
    text = text.replace(/\s/g,"")
    text && currentParent.children.push({
      type:TEXT_TYPE,
      text,
      parent: currentParent
    })

  }
  function end (){
    stack.pop();
    currentParent = stack[stack.length - 1]
  }
  // 一边解析一边删除已经解析过的html字符串
  function advance(n) {
    html = html.substring(n);
  }
  // 解析开始标签
  function parseStartTag() {
    const start = html.match(startTagopen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [], //标签属性
      };
      advance(start[0].length);

      let attr, end;
      // 记录属性并删除
      while (
        !(end = html.match(startTagclose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        });
      }
      if (end) {
        advance(end[0].length);
      }
      return match;
    }
    return false; //不是开始标签就返回
  }
// 循环解析html内容
  while (html) {
    // 如果 indexOf的索引是0，则说明是个开始或者结束标签
    // 如果 indexOf的索引 > 0，则说明时文本的结束位置
    let textEnd = html.indexOf("<");
    if (textEnd == 0) {
      const startTagMatch = parseStartTag(); //开始标签的解析结果
      if(startTagMatch) { //解析到开始标签
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue;
      }
     let endTagMatch =  html.match(endTag);//结束标签；
     if(endTagMatch){
       advance(endTagMatch[0].length);
       end(endTagMatch[0])
       continue;
     }
    }
    if(textEnd > 0){
      let text = html.substring(0, textEnd); //文本内容
      if(text) {
        chars(text);
        advance(text.length) //解析到的文本
      }
      continue;
    }
  }
}

export function compileToFunction(template) {
  // 将template 转化成ast语法树
  let ast = parseHTML(template);
  // 生成render方法 （render方法返回结果就是 虚拟dom)
}
