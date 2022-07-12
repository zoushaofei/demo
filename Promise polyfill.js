// 判断变量否为function
var isFunction = variable => Object.prototype.toString.call(variable) === '[object Function]'

// 定义Promise的三种状态常量
var PENDING = 'PENDING'
var FULFILLED = 'FULFILLED'
var REJECTED = 'REJECTED'

var JPromise = function (handle) {
  if (!isFunction(handle)) {
    throw new Error('JPromise must accept a function as a parameter')
  }
  // 添加状态
  this._status = PENDING
  // 添加状态
  this._value = undefined
  // 添加成功回调函数队列， 这里是为了then方法做准备，每调用一次then方法都会添加一个回调
  this._fulfilledQueues = []
  // 添加失败回调函数队列
  this._rejectedQueues = []
  // 执行handle
  try {
    handle(this._resolve.bind(this), this._reject.bind(this))
  } catch (err) {
    this._reject(err)
  }
}
//定义resolve时执行函数
JPromise.prototype._resolve = function (val) {
  var self = this
  //考虑到promise使用resolve时存在两种情况，一种是直接resolve一个值，一种是resolve一个promise，
  //在这里都需要考虑进来；在这里resolve代码应该设置为异步执行保证同一个回调中的其他同步代码不被跳过
  //如果状态不为pending，则不执行接下来的代码，否则就把改promise的状态置为fullfilled
  if (this._status !== PENDING) return
  var run = function () {
    self._status = FULFILLED
    //当fullfilled时，我们需要把_fulfilledQueues，成功回调队列中的所有的函数给清空掉
    var runFulfilled = function (value) {
      var cd = null;
      while (cb = self._fulfilledQueues.shift()) {
        cb(value)
      }
    }
    //当rejected时，我们需要把_rejectedQueues，失败回调队列中的所有的函数给清空掉
    var runRejected = function (error) {
      var cb = null;
      while (cb = self._rejectedQueues.shift()) {
        cb(error)
      }
    }
    //在这里来进行resolve值val的处理，分为val为普通值和promise实例两种情况
    if (val instanceof JPromise) {
      val.then(function (value) {
        self._value = value
        runFulfilled(value)
      }, function (err) {
        self._value = err
        runRejected(err)
      })
    } else {
      self._value = val
      runFulfilled(val)
    }
  }
  //为了保证resolve后面的同步代码优先执行， 这里设置为异步
  setTimeout(run, 0)
};
//ok我们再来定义reject函数，相较于resolve，我们只需要处理失败时的回调队列即可
JPromise.prototype._reject = function (err) {
  var self = this
  if (this._status !== PENDING) return
  var run = function () {
    self._status = REJECTED
    self._value = err
    var cb
    while (cb = self._rejectedQueues.shift()) {
      cb(err)
    }
  }
  //理由同上
  setTimeout(run, 0)
}
//then方法
JPromise.prototype.then = function (onFulfilled, onRejected) {
  var _status = this._status
  var _value = this._value
  var self = this
  //众所周知，then方法应该返回一个promise，否则无法实现then的链式调用
  return new JPromise(function (onFulfilledNext, onRejectedNext) {
    //封装成功时的执行函数
    var fulfilled = function (value) {
      try {
        if (!isFunction(onFulfilled)) {
          onFulfilledNext(value)
        } else {
          var res = onFulfilled(value);
          if (res instanceof JPromise) {
            // 如果当前回调函数返回JPromise对象，必须等待其状态改变后在执行下一个回调
            res.then(onFulfilledNext, onRejectedNext)
          } else {
            //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
            onFulfilledNext(res)
          }
        }
      } catch (err) {
        debugger;
        // 如果函数执行出错，新的Promise对象的状态为失败
        onRejectedNext(err)
      }
    }
    //封装失败时的执行函数
    var rejected = function (error) {
      try {
        if (!isFunction(onRejected)) {
          onRejectedNext(error)
        } else {
          var res = onRejected(error);
          if (res instanceof JPromise) {
            // 如果当前回调函数返回JPromise对象，必须等待其状态改变后在执行下一个回调
            res.then(onFulfilledNext, onRejectedNext)
          } else {
            //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
            onFulfilledNext(res)
          }
        }
      } catch (err) {
        // 如果函数执行出错，新的Promise对象的状态为失败
        onRejectedNext(err)
      }
    }
    switch (_status) {
      // 当状态为pending时，将then方法回调函数加入执行队列等待执行
      case PENDING:
        self._fulfilledQueues.push(fulfilled)
        self._rejectedQueues.push(rejected)
        break
      // 当状态已经改变时，立即执行对应的回调函数
      case FULFILLED:
        fulfilled(_value)
        break
      case REJECTED:
        rejected(_value)
        break
    }
  })
}
//catch方法
JPromise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected)
}
//resolve静态方法，即直接调用JPromise.resolve使用， 不能被实例继承
JPromise.resolve = function (value) {
  // 如果参数是JPromise实例，直接返回这个实例
  if (value instanceof JPromise) return value
  return new JPromise(function (resolve) { resolve(value) })
}
// 添加静态reject方法
JPromise.reject = function (value) {
  if (value instanceof JPromise) return value
  return new JPromise(function (resolve, reject) { reject(value) })
}
// 添加静态all方法, 需要返回一个JPromise，当list中所有JPromise状态都为resolve时，外层JPromise被resolve；有一个内部JPromise被reject则被rejected
JPromise.all = function (list) {
  var self = this
  return new JPromise(function (resolve, reject) {
    //返回值的集合
    var values = []
    var count = 0
    list.forEach(function (p, i) {
      self.resolve(p).then(function (res) {
        values[i] = res
        count++
        // 所有状态都变成fulfilled时返回的JPromise状态就变成fulfilled
        if (count === list.length) resolve(values)
      }, function (err) {
        // 有一个被rejected时返回的JPromise状态就变成rejected
        reject(err)
      }
      )
    })
  })
}
// 添加静态race方法, 和all类似，只是list有一个promise状态为fullfiled时， 就改变整个外层promise状态
JPromise.race = function (list) {
  var self = this
  return new JPromise(function (resolve, reject) {
    list.forEach(function (p, i) {
      self.resolve(p).then(function (res) {
        resolve(res)
      }, function (err) {
        // 有一个被rejected时返回的JPromise状态就变成rejected
        reject(err)
      }
      )
    })
  })
}
//finnally和then功能很类似，只是里面的回调永远都是在队列的最后执行
JPromise.prototype.finally = function (cb) {
  var self = this
  return self.then(
    function (value) { JPromise.resolve(cb()).then(function () { return value }) },
    function (reason) { JPromise.resolve(cb()).then(function () { throw reason }) }
  );
}
JPromise.prototype.done = function (onFulfilled, onRejected) {
  var self = this
  self.then(onFulfilled, onRejected)
    .catch(function (reason) {
      console.log('reason', reason)
      // 抛出一个全局错误
      throw (`错误为${reason}`)
    })
}

var p = new JPromise((r) => r('666'))
p.then((res) => {
  console.log(res, 'finally')
  return JPromise.resolve('777')
}).then((res) => {
  console.log('p._value', p._value)
  console.log('res', res)
})

// p.then((res) => console.log(res))
  // .then((res) => console.log(res))