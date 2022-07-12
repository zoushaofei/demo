// 抽象饮料类
class Beverage {
  init () {
    // 模版方法
    this.boilWater()
    this.brew()
    this.pourInCup()
    if (this.customerWantsCondiments()) {
      this.addCondiments()
    }
  }
  boilWater () {
    // 具体方法
    console.log("把水煮沸")
  }
  brew () {
    // 抽象方法 brew
    throw new Error("子类必须重写 brew 方法")
  }
  pourInCup () {
    // 抽象方法 pourInCup
    throw new Error("子类必须重写 pourInCup 方法")
  }
  addCondiments () {
    // 抽象方法 addCondiments
    throw new Error("子类必须重写 addCondiments 方法")
  }
  customerWantsCondiments () {
    // 默认需要调料
    return true
  }
}

class Coffee extends Beverage {
  brew () {
    console.log("用沸水冲泡咖啡")
  }
  pourInCup () {
    console.log("把咖啡倒进杯子")
  }
  addCondiments () {
    console.log("加糖和牛奶")
  }
}

class Tea extends Beverage {
  brew () {
    console.log("用沸水浸泡茶叶")
  }
  pourInCup () {
    console.log("把茶倒进杯子")
  }
  customerWantsCondiments () {
    return false
  }
}
var coffee = new Coffee()
coffee.init()
var tea = new Tea()
tea.init()
// var beverage = new Beverage()
// beverage.init()33e