// 内部迭代器
var each = function (ary, callback) {
  for (let i = 0; i < ary.length; i++) {
    callback.call(ary[i], i, ary[i])
  }
}

// each([1, 2, 3], function (i, n) {
//   console.log(i, n)
// })

// 外部迭代器
class Iterator {
  constructor(ary) {
    this._ary = ary
  }
  _current = 0
  currentValue = undefined
  next = function () {
    if (this._current < this._ary.length) {
      var current = this._current
      this._current++
      this.currentValue = this._ary[current]
      return {
        done: false,
        value: this._ary[current]
      }
    } else {
      this.currentValue = undefined
      return {
        done: true,
        value: undefined
      }
    }
  }
}

// var it = new Iterator([1, 2, 3, 8, 9, 0])
// console.log(it)
// while (!it.next().done) {
//   console.log(it.currentValue)
// }