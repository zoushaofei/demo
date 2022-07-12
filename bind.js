// bind

Function.prototype.bind2 = function (context) {

  if (typeof this !== "function") {
    throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
  }

  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);

  var fNOP = function () { };
  fNOP.prototype = this.prototype;

  var fBound = function () {
    var bindArgs = Array.prototype.slice.call(arguments);
    // console.log(this instanceof fNOP)
    return self.apply(this instanceof fNOP ? this : (context || this), args.concat(bindArgs));
  }

  fBound.prototype = new fNOP();
  // console.log('bind2', fBound.constructor)
  return fBound;
}



var value = 1;

global.value = 2

function bar () {
  console.log(this.value);
}

var foo = {
  value: 3,
  bar: bar,
  // barBind: bar.bind(null),
  // barBind2: bar.bind2(null)
};

// var barBind = bar.bind(foo)

var barBind2 = bar.bind2(foo)

// bar() // this => global

// foo.bar() // this => foo

// foo.barBind() // this => global

// foo.barBind2() // this => global

// barBind() // this => foo

// barBind2()
var b = new barBind2()
console.log(b)