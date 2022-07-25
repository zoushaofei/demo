// 调度器 缓存队列
export const queueJob = (function () {
  const queue = new Set();
  let isFlushing = false;
  const p = Promise.resolve();
  return function (job) {
    queue.add(job);
    if (!isFlushing) {
      isFlushing = true;
      p.then(() => {
        try {
          queue.forEach(job => job());
        } finally {
          isFlushing = false;
          queue.clear();
        }
      });
    }
  };
})();