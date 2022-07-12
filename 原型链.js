// 原型链

// javaScript 中，万物皆对象！



// constructor 构造函数
// prototype 实例原型 或 原型对象，函数对象才存在
// __proto__ 通常情况指向其构造函数的原型对象


// 普通对象的 __proto__ 通常指向 Object.prototype，例如 Math JSON
// 使用字面量方法与 new Object 方法创建的对象相同，__proto__ 指向其构造函数的原型对象
// 但 Object.create() 方法创建的对象，将使用提供的对象来新创建的对象的__proto__

var origin = {
  origin: true
}
var object = Object.create(origin)

console.log(origin)
// {origin: true}
console.log(origin.__proto__)
// {constructor: ƒ, __defineGetter__: ƒ, __defineSetter__: ƒ, hasOwnProperty: ƒ, __lookupGetter__: ƒ, …}
console.log(object)
// {}
console.log(object.origin)
// true
console.log(object.__proto__)
// {origin: true}

console.log(origin.constructor === Object)
// true
console.log(origin.__proto__ === Object.prototype)
// true
console.log(origin.prototype === undefined)
 // true

console.log(object.constructor === Object)
// true
console.log(object.__proto__ === origin)
// true
console.log(object.prototype === undefined)
// true



// 凡是通过 new Function() 创建的对象都是函数对象，其他的都是普通对象。
// Date String Array Object Function 等也都是函数对象
// 每个对象都有 __proto__ 属性，但只有函数对象才有 prototype 属性。
// 所有函数对象的 __proto__ 都指向 Function.prototype ，它是一个空函数 (Empty function)

function Person (name) {
  this.name = name
}
Person.prototype.name = 'Person'
Person.prototype.age = 18
Person.prototype.sayName = function () {
  console.log(this.name)
}
Person.prototype.sayAge = function () {
  console.log(this.age)
}

var person1 = new Person('person1')
person1.sayName() // person1
Person.prototype.sayName() // Person
person1.sayAge() // 18
Person.prototype.sayAge() // 18

console.log(person1)
// Person {name: 'person1'}
console.log(person1.__proto__)
// {name: 'Person', age: 18, sayName: ƒ, sayAge: ƒ, constructor: ƒ}
console.log(Person)
// ƒ Person (name) {
//   this.name = name
// }
console.log(Person.__proto__)
// ƒ ()

console.log(person1.constructor === Person)
// true
console.log(person1.__proto__ === Person.prototype)
// true
console.log(person1.prototype === undefined)
// true

console.log(Person.constructor === Function)
// true
console.log(Person.__proto__ === Function.prototype)
// true
console.log(Person.prototype.constructor === Person)
// true
console.log(Person.prototype.__proto__ === Object.prototype)
// true



// 原型链的形成真正是靠 __proto__ 而非 prototype

// __proto__ 现已被不推荐使用,更推荐使用:
// Object.getPrototypeOf/Reflect.getPrototypeOf
// Object.setPrototypeOf/Reflect.setPrototypeOf

console.log(Function.constructor === Function)
// true
console.log(Function.__proto__ === Function.prototype)
// true
console.log(Function.prototype.constructor === Function)
// true
console.log(Function.prototype.__proto__ === Object.prototype)
// true

console.log(Object.constructor === Object)
// false
console.log(Object.constructor === Function)
// true
console.log(Object.__proto__ === Function.prototype)
// true
console.log(Object.prototype.constructor === Object)
// true
console.log(Object.prototype.__proto__ === null)
// true



// 1、 person1.__proto__ 是什么？
// 2、 Person.__proto__ 是什么？
// 3、 Person.prototype.__proto__ 是什么？
// 4、 Object.__proto__ 是什么？
// 5、 Object.prototype.__proto__ 是什么？

// 1、
// person1.__proto__ 指向 person1 的构造函数的原型对象
// 即 Person.prototype

// 2、
// Person.__proto__ 指向 Person 的构造函数的原型对象
// Person 的构造函数是 Function
// 即 Function.prototype

// 3、
// 将 Person.prototype 看作普通对象，那么其构造函数为 Object
// 即 Object.prototype

// 4、
// Object.__proto__ 指向 Object 构造函数的原型对象
// Object 的构造函数是 Function
// 即 Function.prototype

// 5、
// 虽然 Object.prototype 的构造函数是 Object
// 但是 Object.prototype.__proto__ 确较为特殊，为 null
// null 为原型链顶端

// 借鉴
// https://www.jianshu.com/p/dee9f8b14771
// https://www.jianshu.com/p/652991a67186
// https://www.jianshu.com/p/a4e1e7b6f4f8