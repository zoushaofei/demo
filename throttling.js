// 节流
function throttling (fn, interval = 3000) {
  let timer = null;
  let isFirst = true;

  return function () {
    const self = this
    let args = arguments
    if (isFirst) {
      fn.apply(self, args)
      isFirst = false
    }
    if (timer) {
      return false
    }
    timer = setTimeout(function () {
      clearTimeout(timer)
      timer = undefined
      fn.apply(self, args)
    }, interval)
  }
}

const fn = throttling(function (time) {
  console.log(time)
})

setInterval(() => {
  const time = Date.now()
  console.log(time)
  fn('fn' + time)
}, 500);