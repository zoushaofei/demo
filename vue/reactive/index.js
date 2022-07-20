const bucket = new WeakMap();

let activeEffect;
// 副作用函数栈
const effectStack = [];

export function reactive (data) {
  return new Proxy(data, {
    get (target, key, receiver) {
      track(target, key);
      // 使用 Reflect.get 可以解决代理的 data 上的 key 为访问器属性
      return Reflect.get(target, key, receiver);
    },
    set (target, key, newVal) {
      target[key] = newVal;
      trigger(target, key);
      return true;
    }
  });
}

// 副作用函数的依赖进行追踪
function track (target, key) {
  if (!activeEffect) {
    return;
  }
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

// 响应变化 触发对应副作用函数
function trigger (target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) {
    return;
  }
  const effects = depsMap.get(key);
  const effectToRun = new Set();
  // 避免循环调用
  // 例如在副作用函数中改变触发自身的依赖：effect(() => obj.foo++)
  // 即触发了 track 也触发了 trigger
  effects.forEach(effectFn => {
    // 如果 trigger 触发的副作用函数与当前正在执行的副作用函数相同，则不触发执行
    if (effectFn !== activeEffect) {
      effectToRun.add(effectFn);
    }
  });
  effectToRun && effectToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      // 副作用函数 调度器
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}

// 副作用收集函数
export function effect (fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(activeEffect);
    const res = fn();
    // 副作用函数栈 解决 effect 嵌套时，外部 effect 收集的副作用函数被内部 effect 覆盖的问题
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

// 清理副作用函数 用来处理三元表达式等分支切换的副作用函数多次触发问题
function cleanup (effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

export function computed (getter) {
  let value;
  let dirty = true;
  const effectFn = effect(getter, {
    lazy: true,
    scheduler () {
      dirty = true;
      trigger(obj, 'value');
    }
  });

  const obj = {
    get value () {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, 'value');
      return value;
    }
  };
  return obj;
}

export function watch (source, cb, options = {}) {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  let oldValue, newValue;
  // cleanup 用来储存用户注册的过期回调函数
  let cleanup;
  // 注册过期回调函数
  // 用户在 onInvalidate 回调中可以处理竞态问题
  function onInvalidate (fn) {
    cleanup = fn;
  }
  const job = () => {
    newValue = effectFn();
    if (cleanup) {
      cleanup();
    }
    cb(newValue, oldValue, onInvalidate);
    oldValue = newValue;
  };
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: () => {
      // options.flush 控制调度函数的执行时机
      if (options.flush === 'post') {
        // flush 为 post 则放入微队列中 异步执行
        const p = Promise.resolve();
        p.then(job);
      } else {
        // flush 为 async 则同步执行
        job();
      }
    }
  });
  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}

function traverse (value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return;
  }
  seen.add(value);
  for (const k in value) {
    traverse(value[k], seen);
  }
  return value;
}
