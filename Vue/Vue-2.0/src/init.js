import { compileToFunction } from "./compiler/index";
import { initState } from "./state";

export function initMixin(Vue) {

    Vue.prototype._init = function(options){
        // vue 指令 vm vm
        const vm = this;
        vm.$options = options;
        // 初始化状态（数据）
        initState(vm);
        if(options.el){
            vm.$mount(options.el) //数据挂载到页面模板
        }
    }
    Vue.prototype.$mount = function(el) {
        const vm = this;
        el = document.querySelector(el);
        let ops = vm.$options;
        if(!ops.render){ //先看是否有render
            let template; //是否有template,没写采用外部el的template
            if(!ops.template && el){
                template = el.outerHTML

            }else{
                if(el){
                    template = ops.template; //写了template就用template
                }
            }
            if(template){
                const render = compileToFunction(template);
                ops.render = render; //jsx 最终编译程 h("xxx")
            }
        }
        ops.render; //统一使用render方法
        //script 标签引用的vue.gloabal.js 这个编译过程在浏览器运行
        // runtime不包含模板编译，整个编译过程是打包的时候loader来转义.vue文件，用runtime时不能使用 template:""

    }
}
