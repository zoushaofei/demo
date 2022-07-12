// 函数柯里化
function currying (fn) {
  const args = []
  const result = function () {
    if (arguments.length === 0) {
      return fn.apply(this, args)
    } else {
      args.push(...arguments)
      return result
    }
  }
  return result
}

function costGenerator () {
  let sum = 0
  return function () {
    for (let i = 0; i < arguments.length; i++) {
      sum += arguments[i]
    }
    return sum
  }
}

const cost = currying(costGenerator())

cost(1)(2)(3, 3)(4)

console.log(cost())

Function.prototype.unCurrying = function () {
  return (self, ...args) => this.apply(self, args)
}

Array.push = Array.prototype.push.unCurrying()

var obj = {
  length: 3,
  0: 1,
  1: 2,
  2: 3
}
Array.push(obj, 4)
console.log(obj)