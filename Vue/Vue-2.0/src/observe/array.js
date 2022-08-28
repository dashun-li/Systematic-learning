// 重写数组中方法
 
let oldArrayPro = Array.prototype;

// newArrayProto.__proto__ = oldArrayPro 保证Array的方法不改变
export let newArrayProto = Object.create(oldArrayPro);

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
    // 重写数组方法
    newArrayProto[method] = function(...rest){
        //通过调用老的方法  函数劫持，切片编程
       const result = oldArrayPro[method].call(this, ...rest); 
    //    新增的数据未被劫持，数据需要再次被劫持
    let inserted;
    let ob = this.__ob__
    switch(method){
        case "push":
        case "unshift":
            inserted = rest;
            break;
        case "splice":
            // 拿到新增的数组数据
            inserted = rest.slice(2)
            break
            default:
                break
    }
    // inserted 数组
    if(inserted){
        //如果有新增则将监听新增的对象
        ob.observeArray(inserted)
    } 
       return result;
    }
})