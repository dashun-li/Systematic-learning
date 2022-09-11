import { parseHTML } from "./parse";
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配的 {{XXX}} 表达式

// 处理dom属性
function genProps(attrs) {
  let str = ""; //{name, value}
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name == "style") {
      // color: red => {color： "red"}
      let obj = {};
      attr.value.split(";").forEach((item) => {
        let [key, value] = item.split(":");
        obj[key] = value;
      });
      attr.value = obj
    }

    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

function gen(node) {
  if (node.type === 1) {
    return codegen(node);
  } else {
    //文本
    // 1.模板字符串 2.纯文本
    let text = node.text;
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    } else {
      //_v(_s(name) + 'hello' + _s(name))
      let tokens = [];
      let match;
      let lastIndex = 0;
      // exec + 全局匹配/s/g 要重置顺序
      // 在全局模式下，当 exec() 找到了与表达式相匹配的文本时，在匹配后，它将把正则表达式对象的 lastIndex 属性设置为匹配文本的最后一个字符的下一个位置。这就是说，您可以通过反复调用 exec() 方法来遍历字符串中的所有匹配文本。当 exec() 再也找不到匹配的文本时，它将返回 null，并把 lastIndex 属性重置为 0。
      defaultTagRE.lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        let index = match.index; //匹配的位置， 便于取两个模板字符串中间的字符串 {{name}} hello {{age}}
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      // {{a}} hello
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join("+")})`;
    }
  }
}

function genChildren(el) {
  const children = el.children;
  if (children) {
    return children.map((child) => gen(child)).join(",");
  }
}

function codegen(ast) {
  let children = genChildren(ast);
  let code = `_c("${ast.tag}",${
    ast.attrs.length > 0 ? genProps(ast.attrs) : null
  }${ast.children.length ? `,${children}` : ""}
  )`;
  return code;
}

export function compileToFunction(template) {
  // 将template 转化成ast语法树
  let ast = parseHTML(template);
  // 生成render方法 （render方法返回结果就是 虚拟dom)

  // 模板引擎实现原理: with + new Function
  let code = codegen(ast);
  // with (Math) {
  //   a = PI * r * r;
  //   x = r * cos(PI);
  //   y = r * sin(PI / 2);
  // }
  code = `with(this){ return ${code} }`;
  let render = new Function(code);
  return render;
  // render () {
  //   return _c("div",{
  //     id:"app"
  //   },_c("div",{style:"red"}),_v(_s(name)+hello))
  // }
}
