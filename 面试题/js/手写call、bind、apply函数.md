### 手写call、bind、apply函数
#### call
* 分析函数特点
    * 使用函数的对象（this）
    * 传入函数的参数
    * 执行函数
```
Function.prototype.mycall = function (target, ...arg) {
    //1. 借用函数的对象（this）;如果传入的时null则设置为window对象。
    const obj = target || window;
    const key = new Symbol();
    //将函数绑定为对象的属性，完成this的绑定切换
    target[key] = this;
    2. 传入函数的参数并执行借用的函数
    const result = target[key](...arg);
    //删除属性
    delete target[key];
    return result;
}
```

#### apply
* 分析函数特点
    * 与call相比，参数传入的是数组
```
Function.prototype.myapply = function (target, arg) {
    //1. 借用函数的对象（this）;如果传入的时null则设置为window对象。
    const obj = target || window;
    const key = new Symbol();
    //将函数绑定为对象的属性，完成this的绑定切换
    target[key] = this;
    2. 传入函数的参数并执行借用的函数
    const result = target[key](...arg);
    //删除属性
    delete target[key];
    return result;
}
```

#### bind
* 分析函数特点
    * 使用函数的对象（this）
    * 传入函数的参数
    * 返回新的函数
```
Function.prototype.mybind = function (target, ...arg) {
    const obj = target || {};
    const key = new Symbol();
    //将函数绑定为对象的属性，完成this的绑定切换
     target[key] = this
    return function (...innerArgs) { // 返回一个函数
        const res = target[key](...arg, ...innerArgs) 
        return res
    } 
}
```


