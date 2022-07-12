function Person (name) {
  this.name = name
}

var p1 = new Person('p1')

console.log(p1)
// Person {name: 'p1'}
var p2 = {}
// Person.call(p2,'p2')

console.log(p2)
// {name: 'p2'}
p2.__proto__ = Person.prototype
// {constructor: ƒ}
console.log(p2)
// Person {name: 'p2'}