// Generators(生成器)
function* example () {
  yield 1
  yield 2
  yield 3
  return '666'
}
var iter = example()
console.log(iter.next()) // { value: 1, done: false }
console.log(iter.next()) // { value: 2, done: false }
console.log(iter.next()) // { value: 3, done: false }
console.log(iter.next()) // { value: '666', done: true }


// 迭代器嵌套

function* g1 () {
  console.log(arguments) // Arguments(1) [0, callee: ƒ, Symbol(Symbol.iterator): ƒ]
  var arg1 = yield 1
  console.log(arg1) // ___1
  var arg2 = yield 2
  console.log(arg2) // ___2.1
  yield* g2()
  return 4
}

function* g2 () {
  yield 3.1
  yield 3.2
  return 3.3
}

var g = g1(0)

console.log(g.next('___0'))
console.log(g.next('___1'))
console.log(g.next('___2.1', '___2.2'))
console.log(g.next())
console.log(g.next())