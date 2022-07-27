const bucket = new WeakMap();

// 当前收集的副作用函数
let activeEffect;
// 副作用函数栈
const effectStack = [];
// 追踪 循环迭代的依赖 所用的key

const reactiveMap = new Map();

const ITERATE_KEY = Symbol();

const MAP_KEY_ITERATE_KEY = Symbol();

const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE',
};

const TargetType = {
  INVALID: 0,
  COMMON: 1,
  COLLECTION: 2
};

function targetTypeMap (rawType) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON;
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION;
    default:
      return TargetType.INVALID;
  }
}

const toTypeString = (value) => Object.prototype.toString.call(value);

const toRawType = (value) => toTypeString(value).slice(8, -1);

function getTargetType (value) {
  // return value[ReactiveFlags.SKIP] || !Object.isExtensible(value)
  //   ? TargetType.INVALID
  //   : targetTypeMap(toRawType(value))
  return targetTypeMap(toRawType(value));
}

const arrayInstrumentations = {};

// 隐式修改数组唱的的方法
// 当 shouldTrack 为 false 时 禁止追踪依赖
// 因为这些操作会隐式的修改和读取 length 属性，而其本身语义是修改操作
// 因此需要屏蔽依赖追踪，避免形成死循环
let shouldTrack = true;
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    shouldTrack = false;
    const res = originMethod.apply(this, args);
    shouldTrack = true;
    return res;
  };
});

// 不会修改数组长度的方法
;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    const res = originMethod.apply(this, args);
    if (res === false || res === -1) {
      res = originMethod.apply(this._raw, args);
    }
    return res;
  };
});

const mutableInstrumentations = {
  add (key) {
    const target = this._raw;
    const hadKey = target.has(key);
    const res = target.add(key);
    if (!hadKey) {
      trigger(target, key, TriggerType.ADD);
    }
    return res;
  },
  delete (key) {
    const target = this._raw;
    const hadKey = target.has(key);
    const res = target.delete(key);
    if (hadKey) {
      trigger(target, key, TriggerType.DELETE);
    }
    return res;
  },
  get (key) {
    const target = this._raw;
    const had = target.has(key);
    track(target, key);
    if (had) {
      const res = target.get(key);
      return typeof res === 'object' ? reactive(res) : res;
    }
  },
  set (key, value) {
    const target = this._raw;
    const had = target.has(key);
    const oldValue = target.get(key);
    // 避免污染数据，不要将响应式数据挂载到原数据上
    const rawValue = value._raw || value;
    target.set(key, rawValue);
    if (!had) {
      trigger(target, key, TriggerType.ADD);
    } else if (oldValue !== value || (oldValue === oldValue && value === value)) {
      trigger(target, key, TriggerType.SET);
    }
  },
  has (key) {
    const target = this._raw;
    const res = target.has(key);
    track(target, key);
    return res;
  },
  forEach (callback, thisArg) {
    const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
    const target = this._raw;
    track(target, ITERATE_KEY);
    target.forEach((v, k) => {
      callback.call(thisArg, wrap(v), wrap(k), this);
    });
  },
  entries: iteratorMethod,
  [Symbol.iterator]: iteratorMethod,
  values: valuesIteratorMethod,
  keys: keysIteratorMethod
};

// 可迭代协议 一个对象实现了 Symbol.iterator 方法
// 迭代器协议 一个对象实现了 next 方法
// Set Map 类型对象的 entries 方法，返回值是一个有 next 方法，而没有 Symbol.iterator 方法的对象
// 一个对象可以同时实现 可迭代协议 和 迭代器协议
function iteratorMethod () {
  const target = this._raw;
  const itr = target[Symbol.iterator]();
  const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
  track(target, ITERATE_KEY);
  return {
    // 迭代器协议
    next () {
      const { value, done } = itr.next();
      return {
        value: value ? [wrap(value[0]), wrap(value[1])] : value,
        done
      };
    },
    // 可迭代协议
    [Symbol.iterator] () {
      return this;
    }
  };
}

function valuesIteratorMethod () {
  const target = this._raw;
  const itr = target.values();
  const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
  track(target, ITERATE_KEY);
  return {
    next () {
      const { value, done } = itr.next();
      return {
        value: wrap(value),
        done
      };
    },
    [Symbol.iterator] () {
      return this;
    }
  };
}

function keysIteratorMethod () {
  const target = this._raw;
  const itr = target.keys();
  const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
  track(target, MAP_KEY_ITERATE_KEY);
  return {
    next () {
      const { value, done } = itr.next();
      return {
        value: wrap(value),
        done
      };
    },
    [Symbol.iterator] () {
      return this;
    }
  };
}

function createReactive (data, isShallow = false, isReadonly = false) {
  const existionProxy = reactiveMap.get(data);
  if (existionProxy) return existionProxy;
  const proxy = new Proxy(data, {
    get (target, key, receiver) {
      // console.log(`get key : ${key}`);
      // 通过 _raw 属性访问原始数据
      if (key === '_raw') {
        return target;
      }
      const targetType = getTargetType(target);
      // 四种集合类型
      if (targetType === TargetType.COLLECTION) {
        if (key === 'size') {
          track(target, ITERATE_KEY);
          return Reflect.get(target, key, receiver);
        }
        if (mutableInstrumentations.hasOwnProperty(key)) {
          return mutableInstrumentations[key];
        }
        return Reflect.get(target, key, receiver);
      }
      // 除了 四种集合类型 之外
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      // 使用 Reflect.get 可以解决代理的 data 上的 key 为访问器属性
      const res = Reflect.get(target, key, receiver);
      if (!isReadonly && typeof key !== 'symbol') {
        // 非只读属性才可建立响应联系
        // 如果 key 是 symbol 类型，则不进行追踪
        track(target, key);
      }
      if (isShallow) {
        // 浅响应
        return res;
      }
      if (typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res);
      }
      return res;
    },
    set (target, key, newVal, receiver) {
      // console.log(`set key : ${key}`);
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }
      const oldVal = target[key];
      // 判断设置操作时 修改属性 还是 新增属性
      // 当操作为修改时 不应该触发 循环迭代 操作
      const type = Array.isArray(target)
        // 当代理对象是数组
        // 被设置的索引值小于数组长度，则是 设置 ，否则为 新增
        ? Number(key) < target.length ? TriggerType.SET : TriggerType.ADD
        : Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD;
      const res = Reflect.set(target, key, newVal, receiver);
      if (target === receiver._raw) {
        // 通过确定 receiver 是否是 target 的代理对象，来屏蔽由原型引起的更新
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          // 只有当值发生变化 才出发响应
          // oldVal === oldVal || newVal === newVal 解决原始值为 NaN 新值也为 NaN 的情况
          trigger(target, key, type, newVal);
        }
      }
      return res;
    },
    deleteProperty (target, key) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }
      // 拦截 delete 操作
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key);
      if (hadKey && res) {
        // 只有当删除的属性是对象所有的 并且删除成功， 才应该触发 循环迭代 相关副作用函数
        trigger(target, key, TriggerType.DELETE);
      }
      return res;
    },
    has (target, key) {
      // 拦截 in 操作符
      track(target, key);
      return Reflect.has(target, key);
    },
    ownKeys (target) {
      // 拦截 for in 循环操作
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY);
      return Reflect.ownKeys(target);
    }
  });
  reactiveMap.set(data, proxy);
  return proxy;
}


// 深响应
export function reactive (data) {
  return createReactive(data);
}

// 浅响应
export function shallowReactive (data) {
  return createReactive(data, true);
}

// 只读
export function readonly (data) {
  return createReactive(data, false, true);
}

// 浅只读
export function shallowReadonly (data) {
  return createReactive(data, true, true);
}

function createRef (val, isShallow = false) {
  if (isRef(val)) {
    return val;
  }
  const wrapper = {
    value: val
  };
  Object.defineProperty(wrapper, '__v_isRef', { value: true });
  return isShallow ? shallowReactive(wrapper) : reactive(wrapper);
}

export function ref (val) {
  return createRef(val);
}

export function shallowRef (val) {
  return createRef(val, true);
}


function isRef (val) {
  return !!(val && val.__v_isRef === true);
}

export function unref (ref) {
  return isRef(ref) ? ref.value : ref;
}

export function toRef (obj, key) {
  if (isRef(obj)) {
    return obj;
  }
  const wrapper = {
    get value () {
      return obj[key];
    },
    set value (val) {
      obj[key] = val;
    }
  };
  Object.defineProperty(wrapper, '__v_isRef', { value: true });
  return wrapper;
}

export function toRefs (obj) {
  if (isRef(obj)) {
    return obj;
  }
  const ret = {};
  for (const key in obj) {
    ret[key] = toRef(obj, key);
  }
  return ret;
}

export function proxyRefs (target) {
  return new Proxy(target, {
    get (target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return value.__v_isRef ? value.value : value;
    },
    set (target, key, newValue, receiver) {
      const value = target[key];
      if (value.__v_isRef) {
        target[key] = newValue;
        return true;
      }
      return Reflect.set(target, key, newValue, receiver);
    }
  });
}

// 副作用函数的依赖进行追踪
function track (target, key) {
  if (!activeEffect || !shouldTrack) {
    return;
  }
  // console.log(`track key : ${key}`, target);
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
function trigger (target, key, type, newVal) {
  // console.log(`trigger type : ${type} newVal : ${newVal}`, target);
  const depsMap = bucket.get(target);
  if (!depsMap) {
    return;
  }
  // 正常的副作用函数
  const effects = depsMap.get(key);
  // 避免循环调用
  const effectToRun = new Set();
  // 例如在副作用函数中改变触发自身的依赖：effect(() => obj.foo++)
  // 即触发了 track 也触发了 trigger
  effects && effects.forEach(effectFn => {
    // 如果 trigger 触发的副作用函数与当前正在执行的副作用函数相同，则不触发执行
    if (effectFn !== activeEffect) {
      effectToRun.add(effectFn);
    }
  });
  // 只有当操作类型为 'ADD' 才触发 ITERATE_KEY 相关的副作用函数
  if (
    type === TriggerType.ADD ||
    type === TriggerType.DELETE ||
    (type === TriggerType.SET && toRawType(target) === 'Map')
    // Map 类型 在使用 forEach 进行遍历时，即关心键，也关心值，所以需要在 SET 操作时也触发副作用函数
  ) {
    const iterateEffects = depsMap.get(ITERATE_KEY);
    iterateEffects && iterateEffects.forEach(effectFn => {
      // 如果 trigger 触发的副作用函数与当前正在执行的副作用函数相同，则不触发执行
      if (effectFn !== activeEffect) {
        effectToRun.add(effectFn);
      }
    });
  }
  // 数组新增操作时应当触发 length 相关副作用函数
  if (type === TriggerType.ADD && Array.isArray(target)) {
    const lengthEffects = depsMap.get('length');
    lengthEffects && lengthEffects.forEach(effectFn => {
      // 如果 trigger 触发的副作用函数与当前正在执行的副作用函数相同，则不触发执行
      if (effectFn !== activeEffect) {
        effectToRun.add(effectFn);
      }
    });
  }
  // 当修改数组 length 为更小值时，会隐式的删除 length 之后的元素，需要触发响应
  if (key === 'length' && Array.isArray(target)) {
    depsMap.forEach((effects, key) => {
      if (key >= newVal) {
        // 将索引大于等于 length 的相关联的副作用函数取出 加入待执行
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectToRun.add(effectFn);
          }
        });
      }
    });
  }
  if ((type === TriggerType.ADD || type === TriggerType.DELETE) && toRawType(target) === 'Map') {
    const iterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY);
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectToRun.add(effectFn);
      }
    });
  }
  effectToRun.forEach(effectFn => {
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
      trigger(obj, 'value', TriggerType.SET);
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


/**
 * 对于 数组 的操作
 * 读取
 * 1. 通过索引访问数组元素值：arr[0]。
 * 2. 访问数组的长度：arr.length。
 * 3. 将数组作为对象，使用 for...in 循环遍历。
 * 4. 使用 for...of 迭代遍历数组。
 * 5. 数组的原型方法，如 concat/join/every/some/find/findIndex/includes 等，以及其他所有不改变原数组的原型方法
 * 修改或写入
 * 1. 通过索引修改数组元素值：arr[1] = 3。
 * 2. 修改数组长度：arr.length = 0。
 * 3. 数组的栈方法：push/pop/shift/unshift。
 * 4. 修改原数组的原型方法：splice/fill/sort 等。
 */

/**
 * Set 类型的属性和方法
 * 1. size
 * 2. add(value)
 * 3. clear()
 * 4. delete(value)
 * 5. has(value)
 * 6. keys()：返回一个迭代器对象，可用于 for...of 循环，迭代器产生的值为集合中的元素值
 * 7. values()：对于 Set 集合类型来说，keys() 与 values() 等价
 * 8. entries()：返回一个迭代器对象，迭代过程中为集合中的每一个元素产生一个数组值 [value, value]
 * 9. forEach(callback[,thisArg])
 */

/**
 * Map 类型的属性和方法
 * 1. size：
 * 2. clear()
 * 3. delete(key)
 * 4. has(key)
 * 5. get(key)
 * 6. set(key, value)
 * 7. keys()：返回一个迭代器对象，迭代过程中会产生键值对的 key 值
 * 8. values()：返回一个迭代器对象，迭代过程中会产生键值对的 value 值
 * 9. entries()：返回一个迭代器对象，迭代过程中会产生由 [key, value] 组成的数组值
 * 10. forEach(callback[,thisArg])
 */