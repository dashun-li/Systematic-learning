import { observe } from "./observe/index";

function initState(vm) {
    const opts = vm.$options;
    if(opts.data) {
        // 初始化数据
        initData(vm)
    }
}
function proxy(vm, target, key) {
    Object.defineProperty(vm, key,{
        // 从_dataz中的数据挂在vm上
        get() {
            return vm[target][key];
        },
        set(newValue) {
            return vm[target][key] = newValue;
        }
    })
}

function initData(vm) {
    let data = vm.$options.data; //data可能是函数  可能是对象；
    data = typeof data === "function" ? data.call(vm) : data;

    //将data绑定到_data上，方便监测实例的数据改变
    vm._data = data; 
    
    // 数据劫持  用defineProperty代理data
    observe(data);
    // vm._data 代理到vm上 方便可以直接取值，且保持vms实例上的data响应式变化 第二次defineProperty
    for(let key in data) {
        proxy(vm, "_data", key)
    }
}

export { initState, initData }