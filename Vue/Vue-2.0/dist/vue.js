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

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      // Object.definProperty 只能劫持已经存在的属性 (vue 为此单独写api $set $delete);
      this.walk(data);
    }

    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        //循环注册对象属性（劫持属性）
        // 重新定义属性 （—性能瓶颈）
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observe;
  }();

  function defineReactive(target, key, value) {
    observe(value);
    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        value = newValue;
      }
    });
  }
  function observe(data) {
    // 对对象劫持
    if (_typeof(data) !== "object" || data == null) {
      return; //只劫持对象
    } // 被劫持过了，就不需要劫持 （判断对象是否被劫持，添加实例，用实例判断是否被劫持）


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

    data = typeof data === "function" ? data.call(vm) : data;
    vm._data = data; // 数据劫持 代理1

    observe(data); // vm._data 代理到vm上 保持vms实例上的data响应式变化 代理2

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // vue 指令 vm vm
      var vm = this;
      vm.$options = options; // 初始化状态

      initState(vm);
    };
  } // function initState(vm) {
  //     const opts = vm.$options;
  //     if(opts.data) {
  //         initData(vm)
  //     }
  // }
  // function initData(vm) {
  //     let data = vm.$option.data; //data可能是函数  可能是对象；
  //     data = typeof data === "function" ? data.call(vm) : data;
  // }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
