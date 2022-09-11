
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"

function Vue(options) {
    this._init(options)
}

initMixin(Vue); //挂载init方法
initLifeCycle(Vue);

export default Vue;