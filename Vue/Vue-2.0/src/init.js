
import { initState } from "./state";

export function initMixin(Vue) {

    Vue.prototype._init = function(options){
        // vue 指令 vm vm
        const vm = this;
        vm.$options = options;
        // 初始化状态
        initState(vm);
    }
}

