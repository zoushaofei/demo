// 继承
// https://github.com/mqyqingfeng/Blog/issues/16

// 1、 原型链继承
// 在创建 Child 的实例时，不能向 Parent 传参
// function Parent () {
//   this.name = 'Parent'
// }

// Parent.prototype.getName = function () {
//   console.log(this.name)
// }

// function Child () {

// }

// Child.prototype = new Parent()

// var parent1 = new Parent()

// parent1.getName()

// var child1 = new Child()

// child1.getName()


// 2、 借用构造函数(经典继承)
// function Parent () {
//   this.names = ['kevin', 'daisy'];
// }

// function Child () {
//   Parent.call(this);
// }

// var child1 = new Child();

// child1.names.push('yayu');

// console.log(child1.names); // ["kevin", "daisy", "yayu"]

// var child2 = new Child();

// console.log(child2.names); // ["kevin", "daisy"]
// 优点：

// 1.避免了引用类型的属性被所有实例共享

// 2.可以在 Child 中向 Parent 传参

// 举个例子：

// function Parent (name) {
//   this.name = name;
// }

// function Child (name) {
//   Parent.call(this, name);
// }

// var child1 = new Child('kevin');

// console.log(child1.name); // kevin

// var child2 = new Child('daisy');

// console.log(child2.name); // daisy



// 3.组合继承
function Parent (name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.getName = function () {
  console.log(this.name)
}

function Child (name, age) {
  Parent.call(this, name);
  this.age = age;
}

Child.prototype.sayName = function () {
  console.log(this.name)
}

function Child_ (name, age) {
  Parent.call(this, name);
  this.age = age;
}

Child_.prototype.sayName = function () {
  console.log(this.name)
}


function Child1 (name, age) {

  Parent.call(this, name);

  this.age = age;

}

function Child2 (name, age) {

  Parent.call(this, name);

  this.age = age;

}

Child1.prototype = new Parent();
Child1.prototype.constructor = Child1;

Child2.prototype = new Parent();
console.log('Child2.prototype.constructor === Parent', Child2.prototype.constructor === Parent)

console.log('Child1.prototype', Child1.prototype)

console.log('Child2.prototype', Child2.prototype)




var child1 = new Child1('kevin1', '18');
var child1_ = new Child2('kevin1_', '18_')
child1_.colors.push('_4')
child1.getName()
child1_.getName()
console.log('child1', child1)
console.log('child1_', child1_)
console.log('child1.colors', child1.colors)
console.log('child1_.colors', child1_.colors)
console.log('child1.__proto__', child1.__proto__)
console.log('child1_.__proto__', child1_.__proto__)
console.log('child1.__proto__.__proto__', child1.__proto__.__proto__)
console.log('child1_.__proto__.__proto__', child1_.__proto__.__proto__)

console.log('--------')

var child2 = new Child2('kevin2', '28');
var child2_ = new Child2('kevin2_', '28_');
child2_.colors.push('_4')
child2.getName()
child2_.getName()
console.log('child2', child2)
console.log('child2_', child2_)
console.log('child2.colors', child2.colors)
console.log('child2_.colors', child2_.colors)
console.log('child2.__proto__', child2.__proto__)
console.log('child2_.__proto__', child2_.__proto__)
console.log('child2.__proto__.__proto__', child2.__proto__.__proto__)
console.log('child2_.__proto__.__proto__', child2_.__proto__.__proto__)

console.log('--------')

function object (o) {
  function F () { }
  F.prototype = o;
  return new F();
}

function prototype (child, parent) {
  // var prototype = object(parent.prototype);
  // var prototype = parent.prototype
  // prototype.constructor = child;
  // child.prototype = prototype;
  // child.prototype = { ...child.prototype, ...parent.prototype };/
  child.prototype = parent.prototype;
  child.prototype.constructor = child;
}

function prototype_ (child, parent) {
  var prototype = object(parent.prototype);
  prototype.constructor = child;
  child.prototype = prototype;
}

// 当我们使用的时候：
prototype(Child, Parent);
Child.prototype.getName = 'getName'
console.log(Child.prototype.getName)
console.log(Child.prototype.sayName)
console.log(Parent.prototype.getName)

// prototype(Child_, Parent);
// Child_.prototype.getName = 'getName'
// console.log(Child_.prototype.getName)
// console.log(Child_.prototype.sayName)
// console.log(Parent.prototype.getName)
// console.log(Parent.prototype.sayName)

// child1.colors.push('black');

// console.log(child1.name); // kevin
// console.log(child1.age); // 18
// console.log(child1.colors); // ["red", "blue", "green", "black"]

// var child2 = new Child('daisy', '20');