import { creatElementVnode, creatTextVNode } from "./vdom/index";

function createElm(vnode) {
  let { tag, props, children, text } = vnode;
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag); // 将真实节点与虚拟节点相对应，后续属性修改方便操作真实节点
    patchProps(vnode.el, props);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    //文本
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
// 更新属性
function patchProps(el, props) {
    for(let key in props){
        if(key === "style"){
            for (let styleName  in props.style){
                el.style[styleName] = props.style[styleName];
            }
        }else{
            el.setAttribute(key, props[key])
        }
    }
}
function patch(oldVnode, vNode) {
  // 初次渲染
  const isRealElement = oldVnode.nodeType; //dom属性
  if (isRealElement) {
    const elm = oldVnode; //获取真实元素
    const parentElm = elm.parentNode; //获取父元素
    let newElem = createElm(vNode); //创建真实元素
    parentElm.insertBefore(newElem, elm.nextSibling); //将新的元素插入老的元素之后
    parentElm.removeChild(elm); //删除老的元素
    return newElem;
  } else {
    // diff
  }
}

export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) {
    //虚拟dom转化为真实Dom
    const vm = this;
    const el = vm.$el;
    // patch 既有初始化又有更新
    patch(el, vnode);
  };
  // _c("div", {}, ...children)
  Vue.prototype._c = function () {
    return creatElementVnode(this, ...arguments);
  };
  // _v(text)
  Vue.prototype._v = function () {
    return creatTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    const str = typeof value === "string" ? value : JSON.stringify(value);
    return str;
  };
  Vue.prototype._render = function () {
    // 渲染的时候，去实例取值，这里就将数据与视图绑定
    const vm = this;
    return vm.$options.render.call(vm); // 通过ast转移后生成的render方法
  };
}

export function mountComponent(vm, el) {
  // el 是通过css选择器获取的真实dom
  vm.$el = el;

  // 1. 调用 render产生虚拟节点  虚拟 DOM
  vm.$el = vm._update(vm._render()); //vm.$options.render() 虚拟节点

  // 2.根据虚拟DOM产生真实DOM

  // 3.插入el元素中
}

/**
 * Vue 核心流程
 *
 * 1. 创造响应式数据
 * 2. 模板转化为ast语法树
 * 3. 将ast语法树转化为render函数
 * 4. 后续每次数据更新可以只执行render
 *
 * render函数会产生虚拟节点（通过使用响应式数据）
 * 根据生成的虚拟节点创造真实DOM
 *
 */
