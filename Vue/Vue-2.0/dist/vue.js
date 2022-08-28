(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
  var startTagclose = /^\s*(\/?)>/;
  // 边解析边删除已解析的模板

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; //用来放元素

    var currentParent; // 指向栈中的最后一个

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
  }

  function compileToFunction(template) {
    // 将template 转化成ast语法树
    parseHTML(template); // 生成render方法 （render方法返回结果就是 虚拟dom)
  }

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
        console.log(key);
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

      ops.render; //统一使用render方法
      //script 标签引用的vue.gloabal.js 这个编译过程在浏览器运行
      // runtime不包含模板编译，整个编译过程是打包的时候loader来转义.vue文件，用runtime时不能使用 template:""
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
