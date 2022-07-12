var handler = function(){
  var a1 = function () {
    console.log('a1')
  }
  var a2 = function () {
    console.log('a2')
  }
  var b1 = function () {
    console.log('b1')
  }
  var b2 = function () {
    console.log('b2')
  }
  var A = function () {
    a1();
    a2()
  }
  var B = function () {
    b1();
    b2()
  }
  var facade = function () {
    A()
    B()
  }
  // 对外提供一个简单易用的高层接口 facade
  // 高层接口将客户请求转发给内部各子系统来完成功能的实现
  // 但客户也可以选择跨国外观这个高层接口来直接访问子系统
  return {
    a1,
    a2,
    b1,
    b2,
    A,
    B,
    facade
  }
}

