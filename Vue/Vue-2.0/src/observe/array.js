// 重写数组中方法
 
let oldArrayPro = Array.prototype;

// Array.prototype
let newArrayProto = Object.create(oldArrayPro);

newArrayProto.push = function() {

}

let methods = [ //找到所有变异方法
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "splice"
]

methods.forEach( method => {
    newArrayProto[method] = function(...rest){
        // 直接调用的话，会直接调用array方法
       const result = oldArrayPro[method].call(this, ...rest); //newproto调用old的方法  函数劫持，切片编程

       return result;
    }
})