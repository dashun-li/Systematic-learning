(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  /**
   * 1.通过遍历html字符串利用正则匹配开始、文本、结束标签
   * 2.每匹配一个字符串就将解析的结果通过ast处理函数处理为ast树形结构
   * 3.每解析完一个标签，在html字符串中删除
   * 4.ast属性结构的函数处理
   *    通过栈的方式储存父节点，父节点始终在栈的最底层
   */
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //匹配的分组时标签名

  var startTagopen = new RegExp("^<".concat(qnameCapture)); //结束标签</XXX>

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //第一组匹配key value匹配 分组3、4、5

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var startTagclose = /^\s*(\/?)>/; // 边解析边删除已解析的模板

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; //用来放元素

    var currentParent; // 指向栈中的最后一个

    var root; // 其中的一个节点

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    } // 最终转换为抽象语法树


    function start(tag, attrs) {
      var node = createASTElement(tag, attrs);

      if (!root) {
        //判断是否为根节点
        root = node;
      }

      if (currentParent) {
        // 储存当前节点的父元素，并将节点push进父元素的子栈
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      stack.push(node);
      currentParent = node; // 栈中的最后一个
    }

    function chars(text) {
      text = text.replace(/\s/g, "");
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function end() {
      stack.pop();
      currentParent = stack[stack.length - 1];
    } // 一边解析一边删除已经解析过的html字符串


    function advance(n) {
      html = html.substring(n);
    } // 解析开始标签


    function parseStartTag() {
      var start = html.match(startTagopen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: [] //标签属性

        };
        advance(start[0].length);

        var attr, _end; // 记录属性并删除


        while (!(_end = html.match(startTagclose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false; //不是开始标签就返回
    } // 循环解析html内容


    while (html) {
      // 如果 indexOf的索引是0，则说明是个开始或者结束标签
      // 如果 indexOf的索引 > 0，则说明时文本的结束位置
      var textEnd = html.indexOf("<");

      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); //开始标签的解析结果

        if (startTagMatch) {
          //解析到开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag); //结束标签；

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[0]);
          continue;
        }
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd); //文本内容

        if (text) {
          chars(text);
          advance(text.length); //解析到的文本
        }

        continue;
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配的 {{XXX}} 表达式
  // 处理dom属性

  function genProps(attrs) {
    var str = ""; //{name, value}

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name == "style") {
        (function () {
          // color: red => {color： "red"}
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      //文本
      // 1.模板字符串 2.纯文本
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        //_v(_s(name) + 'hello' + _s(name))
        var tokens = [];
        var match;
        var lastIndex = 0; // exec + 全局匹配/s/g 要重置顺序
        // 在全局模式下，当 exec() 找到了与表达式相匹配的文本时，在匹配后，它将把正则表达式对象的 lastIndex 属性设置为匹配文本的最后一个字符的下一个位置。这就是说，您可以通过反复调用 exec() 方法来遍历字符串中的所有匹配文本。当 exec() 再也找不到匹配的文本时，它将返回 null，并把 lastIndex 属性重置为 0。

        defaultTagRE.lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var index = match.index; //匹配的位置， 便于取两个模板字符串中间的字符串 {{name}} hello {{age}}

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        } // {{a}} hello


        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }

  function genChildren(el) {
    var children = el.children;

    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(",");
    }
  }

  function codegen(ast) {
    var children = genChildren(ast);
    var code = "_c(\"".concat(ast.tag, "\",").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : null).concat(ast.children.length ? ",".concat(children) : "", "\n  )");
    return code;
  }

  function compileToFunction(template) {
    // 将template 转化成ast语法树
    var ast = parseHTML(template); // 生成render方法 （render方法返回结果就是 虚拟dom)
    // 模板引擎实现原理: with + new Function

    var code = codegen(ast); // with (Math) {
    //   a = PI * r * r;
    //   x = r * cos(PI);
    //   y = r * sin(PI / 2);
    // }

    code = "with(this){ return ".concat(code, " }");
    var render = new Function(code);
    return render; // render () {
    //   return _c("div",{
    //     id:"app"
    //   },_c("div",{style:"red"}),_v(_s(name)+hello))
    // }
  }

  function creatElementVnode(vm, tag, props) {
    if (props == null) {
      props = {};
    }

    var key = props.key;

    if (key) {
      delete props.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, props, children);
  }
  function creatTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  } // ast 做的语法层面的转化，他描述的是语法本身（描述 js css html ）
  // 虚拟dom描述的是dom元素，可以增加自定义属性

  function vnode(vm, tag, key, props, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      props: props,
      children: children,
      text: text
    };
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        props = vnode.props,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === "string") {
      vnode.el = document.createElement(tag); // 将真实节点与虚拟节点相对应，后续属性修改方便操作真实节点

      patchProps(vnode.el, props);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      //文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  } // 更新属性


  function patchProps(el, props) {
    for (var key in props) {
      if (key === "style") {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }

  function patch(oldVnode, vNode) {
    // 初次渲染
    var isRealElement = oldVnode.nodeType; //dom属性

    if (isRealElement) {
      var elm = oldVnode; //获取真实元素

      var parentElm = elm.parentNode; //获取父元素

      var newElem = createElm(vNode); //创建真实元素

      parentElm.insertBefore(newElem, elm.nextSibling); //将新的元素插入老的元素之后

      parentElm.removeChild(elm); //删除老的元素

      return newElem;
    }
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      //虚拟dom转化为真实Dom
      var vm = this;
      var el = vm.$el; // patch 既有初始化又有更新

      patch(el, vnode);
    }; // _c("div", {}, ...children)


    Vue.prototype._c = function () {
      return creatElementVnode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; // _v(text)


    Vue.prototype._v = function () {
      return creatTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      var str = typeof value === "string" ? value : JSON.stringify(value);
      return str;
    };

    Vue.prototype._render = function () {
      // 渲染的时候，去实例取值，这里就将数据与视图绑定
      var vm = this;
      return vm.$options.render.call(vm); // 通过ast转移后生成的render方法
    };
  }
  function mountComponent(vm, el) {
    // el 是通过css选择器获取的真实dom
    vm.$el = el; // 1. 调用 render产生虚拟节点  虚拟 DOM

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

  // 重写数组中方法
  var oldArrayPro = Array.prototype; // newArrayProto.__proto__ = oldArrayPro 保证Array的方法不改变

  var newArrayProto = Object.create(oldArrayPro);
  var methods = [//找到所有变异方法
  "push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    // 重写数组方法
    newArrayProto[method] = function () {
      var _oldArrayPro$method;

      for (var _len = arguments.length, rest = new Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
      }

      //通过调用老的方法  函数劫持，切片编程
      var result = (_oldArrayPro$method = oldArrayPro[method]).call.apply(_oldArrayPro$method, [this].concat(rest)); //    新增的数据未被劫持，数据需要再次被劫持


      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case "push":
        case "unshift":
          inserted = rest;
          break;

        case "splice":
          // 拿到新增的数组数据
          inserted = rest.slice(2);
          break;
      } // inserted 数组


      if (inserted) {
        //如果有新增则将监听新增的对象
        ob.observeArray(inserted);
      }

      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      // Object.definProperty 只能劫持已经存在的属性 (vue 为此单独写api $set $delete);
      // 通过注册数组的索引可以监听变化，但是挂载到实例上会导致过多的属性挂载 影响性能
      // observer实例挂载到data上
      // 如果属性有__ob__ 说明对象被代理过
      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false //循环的时候不可枚举

      }); // data.__ob__ = this;  直接这样写会被一直代理至死循环

      if (Array.isArray(data)) {
        // 监听用户对数组的操作（push shift 。。。)
        // 重写数组变异方法（会改变原数组的方法）
        // 方案 保留原数组特性，重写部分方法 （push shift 。。。)
        data.__proto__ = newArrayProto;
        this.observeArray(data); // 可以检测到数组中的对象
      } else {
        this.walk(data);
      }
    }

    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        //循环注册对象属性（依次劫持属性）
        // 重新定义属性 （—性能瓶颈）
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      } // 监测数组的对象

    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 数组项传入observe时，非对象不会被监测
        data.forEach(function (item) {
          observe(item);
        });
      }
    }]);

    return Observe;
  }(); // 将数据定义为响应式


  function defineReactive(target, key, value) {
    //闭包 属性劫持
    observe(value);
    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue); //当设置将对象修改时，需要再次劫持

        value = newValue;
      }
    });
  }
  function observe(data) {
    // 对对象劫持
    if (_typeof(data) !== "object" || data == null) {
      return; //只劫持对象
    } // 被劫持过了，就不需要劫持 （判断对象是否被劫持，添加实例，用实例判断是否被劫持）


    if (data.__ob__ instanceof Observe) {
      return;
    }

    return new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      // 初始化数据
      initData(vm);
    }
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      // 从_dataz中的数据挂在vm上
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        return vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; //data可能是函数  可能是对象；

    data = typeof data === "function" ? data.call(vm) : data; //将data绑定到_data上，方便监测实例的数据改变

    vm._data = data; // 数据劫持  用defineProperty代理data

    observe(data); // vm._data 代理到vm上 方便可以直接取值，且保持vms实例上的data响应式变化 第二次defineProperty

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // vue 指令 vm vm
      var vm = this;
      vm.$options = options; // 初始化状态（数据）

      initState(vm);

      if (options.el) {
        vm.$mount(options.el); //数据挂载到页面模板
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;

      if (!ops.render) {
        //先看是否有render
        var template; //是否有template,没写采用外部el的template

        if (!ops.template && el) {
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template; //写了template就用template
          }
        }

        if (template) {
          var render = compileToFunction(template);
          ops.render = render; //jsx 最终编译程 h("xxx")
        }
      }

      mountComponent(vm, el); //组件挂载 调用render
      //script 标签引用的vue.gloabal.js 这个编译过程在浏览器运行
      // runtime不包含模板编译，整个编译过程是打包的时候loader来转义.vue文件，用runtime时不能使用 template:""
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue); //挂载init方法

  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
