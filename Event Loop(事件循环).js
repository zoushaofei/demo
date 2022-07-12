// Event Loop（事件循环)

// 当当前执行栈执行完毕时会立刻先处理所有微任务队列中的事件，然后再去宏任务队列中取出一个事件。
// 同一次事件循环中，微任务永远在宏任务之前执行。

// 以下事件属于宏任务

// setInterval()
// setTimeout()

// 以下事件属于微任务

// Promise.then/catch/finally
// new MutaionObserver()

// 例如
setTimeout(function () {
  console.log(1);
});

new Promise(function(resolve,reject){
  console.log(2)
  resolve(3)
}).then(function(val){
  console.log(val);
})

// 2
// 3
// 1