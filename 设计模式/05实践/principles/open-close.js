// 搜狗皮肤例子

// 皮肤类
class AbstractSkin {
    //new 时调用
    constructor(name) {
        // 实例属性，只有实例能访问
        this.name = name;
    }
    // 相当于  function写法中的
    // function AbstractSkin (name) {
    //     this.name = name
    // }

    newFunc() {
        console.log("实例方法")
    }
    // 相当于 function写法中的
    // AbstractSkin.prototype.newFunc = function () {
    //     console.log("实例方法")
    // }

    // 静态属性 只有类能访问
    static info = "静态属性";
    // 相当于 function写法中的
    // AbstractSkin.info = "静态属性"

    // 静态方法 只有类能访问
    static staticFunc() {
        console.log("类的静态方法")
    }
     // 相当于 function写法中的
    // AbstractSkin.staticFunc() {
    //     console.log("类的静态方法")
    // }
    display() {
        console.log("抽象皮肤类")
    }

}

// 默认皮肤类
class DefaultSkin extends AbstractSkin {
//     继承之后，如果子类中没有定义，就会沿用父类中的方法或属性
// 子类对父类的方法和属性可以进行重构和重载
// 但是，如果是继承的父类中有定义构造函数
// 就必须加一个super()
// 然后接着添加子类的构造方法，不能将父类中的构造函数覆盖
// super()是对父类构造器的一个引用，相当于父类中的constructor()方法直接写入到了子类中
    constructor() {
        super()
    }
    display() {
        console.log("默认皮肤类")
    }

}

class HemaSkin extends AbstractSkin {
    constructor() {
        super()
    }
    display() {
        console.log("黑马皮肤类")
    }
}
// 搜狗输入法
class SougouInput {
    // constructor(skin) {
    //     this.skin = skin;
    // }
    setSkin (skin){
        this.skin = skin;
    }
    display() {
        skin.display()
    }
}

// 实践
// 1.创建搜狗输入法对象
// 2.创建皮肤对象（抽象皮肤类的子类）
// 3.设置皮肤到输入法中
// 4. 显示皮肤

const sougou = new SougouInput();

const defaultskin = new DefaultSkin();
sougou.setSkin(defaultskin);
defaultskin.display();

// 分析扩展皮肤  ---  对扩展开放，对修改关闭。不改变之前定义的类，

