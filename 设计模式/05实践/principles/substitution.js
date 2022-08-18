// 里氏代换原则，基类可以使用的方法，子类也可以使用。

// 长方形
class Rectangle {
    constructor(length, width) {
        this.length = length;
        this.width = width;
    }
    getLength() {
        return this.length;
    }
    setLength(length) {
        this.length = length;
    }
    getWidth() {
        return this.width;
    }
    setWidth(width) {
        this.width = width;
    }
}
// 正方形
class Square extends Rectangle {
    constructor(side) {
        super()
        this.length = side;
        this.width = side;
        this.side = side;
    }
    setLength(side) {
        this.side = side;
        console.log(11)
    }
    setWidth(side) {
        this.side = side;
        console.log(side,2)
    }
    setSide(side) {
        this.side = side;
    }
    getSide() {
        return this.side;
    }

}

class RectangleDemo {
    constructor() {

    }
    resizeWidth(rect) {
        while(rect.getWidth() <= rect.getLength()){
            rect.setWidth(rect.getWidth() + 1);
        }
        console.log(rect.getWidth(),111, rect.getLength())
    }
}

// 执行
const square = new Square();
square.setLength()
// 子类未复写时 执行的结果：
// PS C:\Users\Administrator\Desktop\System\Systematic-learning> node .\设计模式\05实践\principles\substitution.js               
// 父类的设置长度

// 创建长方形对象
// 设置长和宽
// resize方法进行扩大宽度到正方形
const rect = new Rectangle(20,10);
const rectResize = new RectangleDemo();
rectResize.resizeWidth(rect);
// const s = new Square(10,10);
// rectResize.resizeWidth(s);


// 上方代码不适用于正方形，违背了里氏代换的原则  ====> 他们之间的继承关系不成立