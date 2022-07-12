var Chain = function (fn) {
  this.fn = fn
  this.successor = null
}

Chain.prototype.setNextSuccessor = function (successor) {
  return this.successor = successor
}

Chain.prototype.passRequest = function () {
  var ret = this.fn.apply(this, arguments)
  if (ret === 'nextSuccessor') {
    return this.successor && this.successor.passRequest.apply(this.successor, arguments)
  }
  return ret
}

Chain.prototype.next = function () {
  return this.successor && this.successor.passRequest.apply(this.successor, arguments)
}

var fn1 = new Chain(function () {
  console.log(1)
  return 'nextSuccessor'
})

var fn2 = new Chain(function () {
  console.log(2)
  var self = this
  setTimeout(() => {
    self.next()
  }, 3000);
})

var fn3 = new Chain(function () {
  console.log(3)
})

// fn1.setNextSuccessor(fn2).setNextSuccessor(fn3)

// fn1.passRequest()
// fn2.passRequest()

Function.prototype.after = function (fn) {
  var self = this
  return function () {
    var ret = self.apply(this, arguments)
    if (ret === 'nextSuccessor') {
      return fn.apply(this, arguments)
    }
    return ret
  }
}

Function.prototype.before = function (fn) {
  var self = this
  return function () {
    var ret = fn.apply(this, arguments)
    if (ret === 'nextSuccessor') {
      return self.apply(this, arguments)
    }
    return ret
  }
}

var test = function () {
  console.log('test', arguments)
  return 'nextSuccessor'
}

// test.before(function () {
//   console.log('before')
//   return 'nextSuccessor'
// }).after(function () {
//   console.log("after")
// })('666')

var fn4 = function () {
  console.log('fn4')
  return 'nextSuccessor'
}
var fn5 = function () {
  console.log('fn5')
  return Math.random() > 0.5 ? 'nextSuccessor' : false
}
var fn6 = function () {
  console.log('fn6')
  return 'nextSuccessor'
}

fn4.after(fn5).after(fn6)()