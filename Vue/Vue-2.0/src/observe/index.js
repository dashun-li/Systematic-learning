

import {newArrayProto} from "./array"
class Observe{
    constructor(data) {
        // Object.definProperty 只能劫持已经存在的属性 (vue 为此单独写api $set $delete);
        // 通过注册数组的索引可以监听变化，但是挂载到实例上会导致过多的属性挂载 影响性能
        // observer实例挂载到data上
         // 如果属性有__ob__ 说明对象被代理过
       Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false //循环的时候不可枚举
       }) 
        // data.__ob__ = this;  直接这样写会被一直代理至死循环
        if(Array.isArray(data)){
            // 监听用户对数组的操作（push shift 。。。)
            // 重写数组变异方法（会改变原数组的方法）
            // 方案 保留原数组特性，重写部分方法 （push shift 。。。)
            data.__proto__ = newArrayProto;
            this.observeArray(data);  // 可以检测到数组中的对象
        }else{
            this.walk(data)
        }

    }
    walk(data) { //循环注册对象属性（依次劫持属性）
        // 重新定义属性 （—性能瓶颈）
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
    // 监测数组的对象
    observeArray(data) {
        // 数组项传入observe时，非对象不会被监测
        data.forEach(item => { observe(item)})
    }
}
// 将数据定义为响应式
export function defineReactive(target, key, value) { //闭包 属性劫持
    observe(value);
    Object.defineProperty(target, key, {
        get() { 
            return value
        },
        set(newValue) {
            if(newValue === value) return;
            observe(newValue); //当设置将对象修改时，需要再次劫持
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
    if(data.__ob__ instanceof Observe){
        return;
    }
    return new Observe(data)
}