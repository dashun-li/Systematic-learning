
class Observe{
    constructor(data) {
        // Object.definProperty 只能劫持已经存在的属性 (vue 为此单独写api $set $delete);
        // 通过注册数组的索引可以监听变化，但是挂载到实例上会导致过多的属性挂载 影响性能
        if(Array.isArray(data)){
            // 监听用户对数组的操作（push shift 。。。)
            // 重写数组编译方法（会改变原数组的方法）
            // 保留原数组特性，重写部分方法
            // 可以检测到数组中的对象
            this.observeArray(data); 
        }else{
            this.walk(data)
        }

    }
    walk(data) { //循环注册对象属性（劫持属性）
        // 重新定义属性 （—性能瓶颈）
        Object.keys(data).forEach(key =>defineReactive(data, key, data[key]))
    }
    // 监测数组改变
    observeArray(data) {
        data.forEach(item => observe(item))
    }
}

export function defineReactive(target, key, value) {
    observe(value);
    Object.defineProperty(target, key, {
        get() { 
            return value
        },
        set(newValue) {
            if(newValue === value) return;
            value =  newValue
        }
    })
}



export function observe(data) {
    // 对对象劫持

    if(typeof data !== "object" || data == null){
        return; //只劫持对象
    }
    // 被劫持过了，就不需要劫持 （判断对象是否被劫持，添加实例，用实例判断是否被劫持）


    return new Observe(data)
}