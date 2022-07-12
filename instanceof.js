
function _instanceof (left, right) {
  // __proto__ 指向其构造函数的原型对象
  // 即 left.__proto__ === Left.prototype
  let leftValue = left.__proto__
  let rightValue = right.prototype
  while (true) {
    if (leftValue === null) {
      return false
    }
    if (leftValue === rightValue) {
      return true
    }
    leftValue = leftValue.__proto__
  }
}

console.log(p instanceof P)
console.log(P instanceof Function)
console.log(p instanceof Function)
console.log(_instanceof(p, P))
console.log(_instanceof(P, Function))
console.log(_instanceof(p, Function))
