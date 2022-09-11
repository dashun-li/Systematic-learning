export function creatElementVnode(vm, tag, props, ...children) {
  if (props == null) {
    props = {};
  }
  let key = props.key;
  if (key) {
    delete props.key;
  }

  return vnode(vm, tag, key, props, children);
}

export function creatTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

// ast 做的语法层面的转化，他描述的是语法本身（描述 js css html ）
// 虚拟dom描述的是dom元素，可以增加自定义属性
function vnode(vm, tag, key,props, children, text) {
  return {
    vm,
    tag,
    key,
    props,
    children,
    text,
  };
}
