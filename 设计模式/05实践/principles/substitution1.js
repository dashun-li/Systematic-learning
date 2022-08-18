// 里氏代换原则，基类可以使用的方法，子类也可以使用。

// 四边形接口
class Quadrilateral {
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
class Square extends Quadrilateral {
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
// 长方形
class Rectangle extends Quadrilateral {
    constructor(length, width) {
        super()
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

// 此时的resize就只适用于长方形,他们不属于父子类的关系,就符合里氏代换.