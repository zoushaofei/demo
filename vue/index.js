import { ref, effect, reactive, shallowRef, proxyRefs, shallowReactive, shallowReadonly } from "./reactivity/index.js";
import { queueJob } from "./utils.js";

import createSimpleDiff from "./diff/doubleEndDiff.js";
import createDoubleEndDiff from "./diff/doubleEndDiff.js";
import createFastDiff from "./diff/fastDiff.js";

// 全局变量，存储当前正在被实例化的组件实例
let currentInstance = null;

function setCurrentInstance (instance) {
  currentInstance = instance;
}

const TYPE_ENUM = {
  TEXT: Symbol('text'),
  COMMENT: Symbol('comment'),
  FRAGMENT: Symbol('fragment')
};

var createRender = function (options) {
  const {
    createElement,
    setElementText,
    createText,
    setText,
    createComment,
    setComment,
    insert,
    patchProps,
    createDiff
  } = options;

  function render (vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        unmount(container._vnode);
      }
    }
    container._vnode = vnode;
  }

  function patch (n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
      if (!anchor && typeof n2.type === 'object') {
        // 当新节点为组件时 确定新组件应插入的位置
        if (n1.el) {
          anchor = n1.el.nextSibling;
        } else if (typeof n1.type === 'object' && n1.component?.subTree?.el) {
          anchor = n1.component.subTree.el.nextSibling;
        }
      }
      unmount(n1);
      n1 = null;
    }
    const { type } = n2;
    if (typeof type === 'string') {
      if (!n1) {
        mountElement(n2, container, anchor);
      } else {
        patchElement(n1, n2);
      }
    } else if (typeof type === 'object' || typeof type === 'function') {
      // type 为 object 是有状态组件
      // type 为 function 是函数式组件
      if (!n1) {
        if (n2.keepAlive) {
          // 如果该组件已经被 keepAlive ，则不应重新挂载它，而是调用其父组件，即 KeepAlive 的 _activate 函数来激活它
          n2.keepAlineInstance._activate(n2, container, anchor);
        } else {
          mountComponent(n2, container, anchor);
        }
      } else {
        patchComponent(n1, n2, anchor);
      }
    } else if (type === TYPE_ENUM.TEXT) {
      if (!n1) {
        const el = n2.el = createText(n2.children);
        insert(el, container, anchor);
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          setText(el, n2.children);
        }
      }
    } else if (type === TYPE_ENUM.FRAGMENT) {
      if (!n1) {
        n2.children.forEach(c => patch(null, c, container));
      } else {
        patchChildren(n1, n2, container);
      }
    } else if (type === TYPE_ENUM.COMMENT) {
      if (!n1) {
        const el = n2.el = createComment(n2.children);
        insert(el, container, anchor);
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          setComment(el, n2.children);
        }
      }
    }
  }

  function patchElement (n1, n2) {
    const el = n2.el = n1.el;
    const oldProps = n1.props;
    const newProps = n2.props;

    if (oldProps && newProps) {
      for (const key in newProps) {
        if (newProps[key] !== oldProps[key]) {
          patchProps(el, key, oldProps[key], newProps[key]);
        }
      }

      for (const key in oldProps) {
        if (!(key in newProps)) {
          patchProps(el, key, oldProps[key], null);
        }
      }
    } else if (oldProps && !newProps) {
      for (const key in oldProps) {
        patchProps(el, key, oldProps[key], null);
      }
    } else if (!oldProps && newProps) {
      for (const key in newProps) {
        patchProps(el, key, null, newProps[key]);
      }
    }

    patchChildren(n1, n2, el);
  }

  function patchChildren (n1, n2, container) {
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      }
      setElementText(container, n2.children);
    } else if (Array.isArray(n2.children)) {
      if (Array.isArray(n1.children)) {
        diff(n1, n2, container);
      } else {
        setElementText(container, '');
        n2.children.forEach(c => patch(null, c, container));
      }
    } else {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      } else if (typeof n2.children === 'string') {
        setElementText(container, '');
      }
    }
  }

  function mountElement (vnode, container, anchor) {
    const el = vnode.el = createElement(vnode.type);

    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        patch(null, child, el);
      });
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key]);
      }
    }

    insert(el, container, anchor);
  }

  function mountComponent (vnode, container, anchor) {
    const isFunctional = typeof vnode.type === 'function';

    let componentOptions = vnode.type;
    if (isFunctional) {
      componentOptions = {
        render: vnode.type,
        props: vnode.type.props
      };
    }
    // 生命周期勾子
    let { render, data, setup, props: propsOptions, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated } = componentOptions;
    beforeCreate && beforeCreate();
    const state = data ? reactive(data()) : null;
    const [props, attrs] = resolveProps(propsOptions, vnode.props);
    // 使用编译好的 children 对象作为 slots 对象即可
    const slots = vnode.children || {};
    // 定义组件实例
    const instance = {
      state,
      props: shallowReactive(props),
      isMounted: false,
      subTree: null,
      slots,
      mounted: [],
      keepAliveCtx: null
    };
    // 当前组件为 KeepAlive 是，为组件实例注入 keepAliveCtx
    const isKeepAlive = componentOptions.__isKeepAlive;
    if (isKeepAlive) {
      instance.keepAliveCtx = {
        move: (vnode, container, anchor) => {
          insert(vnode.component.subTree.el, container, anchor);
        },
        unmount,
        createElement
      };
    }
    // 定义 emit 函数，它接受两个参数
    // event ：时间名称
    // payload ：传递给事件处理函数的参数
    function emit (event, ...payload) {
      const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
      // 在组件实例的props中查找对应的处理函数
      const handler = instance.props[eventName];
      if (handler) {
        handler(...payload);
      } else {
        console.log('事件不存在');
      }
    }

    const setupContext = { attrs, slots, emit };
    // 在调用 setup 前设置当前组件实例
    setCurrentInstance(instance);
    const setupResult = setup && setup(shallowReadonly(instance.props, setupContext));
    // 重置当前组件实例
    setCurrentInstance(null);
    let setupState = null;
    if (typeof setupResult === 'function') {
      if (render) {
        console.error('setup 函数返回渲染函数，render 选项将被忽略');
      }
      render = setupResult;
    } else {
      setupState = setupResult ? proxyRefs(setupResult) : setupResult;
    }
    vnode.component = instance;

    // 渲染上下文对象，本质是组件实例的代理
    // 完整的组件还应包含 methods、computed 等选项中定义的数据和方法，这些内容都应在渲染上下文中处理
    const renderContext = new Proxy(instance, {
      get (t, k, r) {
        const { state, props } = t;
        if (k === '$slots') return slots;
        if (state && k in state) {
          return state[k];
        } else if (k in props) {
          return props[k];
        } else if (setupState && k in setupState) {
          return setupState[k];
        } else {
          console.log('不存在');
        }
      },
      set (t, k, v, r) {
        const { state, props } = t;
        if (state && k in state) {
          state[k] = v;
          return true;
        } else if (k in props) {
          console.warn(`Attempting to mutate prop "${k}". Props are Readonly.`);
        } else if (setupState && k in setupState) {
          setupState[k] = v;
          return true;
        } else {
          console.log('不存在');
        }
        return false;
      }
    });

    created && created.call(renderContext);

    effect(() => {
      const subTree = render.call(renderContext, renderContext);
      if (!instance.isMounted) {
        beforeMount && beforeMount.call(renderContext);
        patch(null, subTree, container, anchor);
        instance.isMounted = true;
        mounted && mounted.call(renderContext);
        instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext));
      } else {
        beforeUpdate && beforeUpdate.call(renderContext);
        patch(instance.subTree, subTree, container, anchor);
        updated && updated.call(renderContext);
      }
      instance.subTree = subTree;
    }, { scheduler: queueJob });
  }

  function resolveProps (options, propsData) {
    const props = {};
    const attrs = {};
    for (const key in propsData) {
      if (key in options || key.startsWith('on')) {
        props[key] = propsData[key];
      } else {
        attrs[key] = propsData[key];
      }
    }
    return [props, attrs];
  }

  function patchComponent (n1, n2, anchor) {
    const instance = (n2.component = n1.component);
    const { props } = instance;

    if (hasPropsChanged(n1.props, n2.props)) {
      const [nextProps] = resolveProps(n2.type.props, n2.props);
      for (const k in nextProps) {
        props[k] = nextProps[k];
      }
      for (const k in props) {
        if (!(k in nextProps)) {
          delete props[k];
        }
      }
    }
  }

  function hasPropsChanged (prevProps = {}, nextProps = {}) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
      return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (nextProps[key] !== prevProps[key]) {
        return true;
      }
    }
    return false;
  }

  function unmount (vnode) {
    if (vnode.type === TYPE_ENUM.FRAGMENT) {
      vnode.children.forEach(c => unmount(c));
      return;
    } else if (typeof vnode.type === 'object') {
      if (vnode.shouldKeepAlive) {
        // 对于需要被 KeepAlive 的组件，应当调用其父组件，即 KeepAlive 的 _deActivate 函数，使其失活
        vnode.keepAlineInstance._deActivate(vnode);
      } else {
        // 对于要卸载组件，本质上是要卸载组件所渲染的内容，即 subTree
        unmount(vnode.component.subTree);
      }
      return;
    }
    const parent = vnode.el.parentNode;
    if (parent) {
      parent.removeChild(vnode.el);
    }
  }

  const diff = createDiff({
    ...options,
    render,
    patch,
    patchElement,
    patchChildren,
    mountElement,
    unmount,
  });

  return {
    render
  };
};

var shouldSetAsProps = function (el, key, value) {
  if (key === 'form' && el.tagName === 'INPUT') return false;

  return key in el;
};

var normalizeClass = function (className) {
  if (typeof className === 'string') {
    return className;
  } else if (Array.isArray(className)) {
    return className.map(item => normalizeClass(item)).filter(Boolean).join(' ');
  } else if (Object.prototype.toString.call(className) === '[object Object]') {
    const classList = Object.entries(className).filter(([k, v]) => v).map(([k]) => k);
    return normalizeClass(classList);
  }
  return '';
};

const createRenderer = createDiff => createRender({
  createDiff,
  createElement (tag) {
    return document.createElement(tag);
  },
  setElementText (el, text) {
    el.textContent = text;
  },
  insert (el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
  createText (text) {
    return document.createTextNode(text);
  },
  setText (el, text) {
    el.setText(text);
  },
  createComment (text) {
    return document.createComment(text);
  },
  setComment (el, text) {
    el.textContent = text;
  },
  patchProps (el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
      const invokers = el._vei || (el._vei = {});
      let invoker = invokers[key];
      const name = key.slice(2).toLowerCase();
      if (nextValue) {
        if (!invoker) {
          invoker = el._vei[key] = (e) => {
            if (e.timeStamp < invoker.attached) return;
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach(fn => fn(e));
            } else {
              invoker.value(e);
            }
          };
          invoker.value = nextValue;
          invoker.attached = performance.now();
          el.addEventListener(name, invoker);
        } else {
          invoker.value = nextValue;
        }
      } else {
        el.removeEventListener(name, invoker);
      }
    }
    else if (key === 'class') {
      el.className = nextValue ? normalizeClass(nextValue) : '';
    }
    // 使用 shouldSetAsProps 判断 是否应该作为 DOM Properties 设置
    else if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key];
      if (type === 'boolean' && nextValue === '') {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      el.setAttribute(key, nextValue);
    }
  }
});

export function onMounted (fn) {
  if (currentInstance) {
    currentInstance.mounted.push(fn);
  } else {
    console.error('onMounted 函数只能在 setup 中调用');
  }
}

export function defineAsyncComponent (options) {
  if (typeof options === 'function') {
    options = {
      loader: options
    };
  }
  const { loader } = options;

  let innerComp = null;

  return {
    name: 'AsyncComponentWrapper',
    setup () {
      const loaded = ref(false);
      const error = shallowRef(null);
      const loading = ref(false);

      let loadingTimer = null;
      // 延迟显示 loading 状态
      if (options.delay) {
        loadingTimer = setTimeout(() => {
          loading.value = true;
        }, options.delay);
      } else {
        loading.value = true;
      }

      loader()
        .then(c => {
          innerComp = c;
          loaded.value = true;
        })
        .catch(err => {
          error.value = err;
        })
        .finally(err => {
          loading.value = false;
          clearTimeout(loadingTimer);
        });

      let timeoutTimer = null;
      if (options.timeout) {
        timeoutTimer = setTimeout(() => {
          const err = new Error(`Async component timed out after ${options.timeout}ms`);
          error.value = err;
        }, options.timeout);
      }
      // 卸载组件时 应清除定时器

      const placeholder = { key: 0, type: TYPE_ENUM.COMMENT, children: 'AsyncComponentWrapper' };

      return () => {
        if (loaded.value) {
          return { key: 0, type: innerComp };
        } else if (error.value && options.errorComponent) {
          return { key: 0, type: options.errorComponent, props: { error: error.value } };
        } else if (loading.value && options.loadingComponent) {
          return { key: 0, type: options.loadingComponent };
        } else {
          return placeholder;
        }
      };
    }
  };
}


const KeepAlive = {
  __isKeepAlive: true,
  props: {
    max: Number,
    include: RegExp,
    exclude: RegExp,
  },
  setup (props, { slots }) {
    // key: vnode.type
    // value: vnode
    const cache = new Map();
    // 记录已缓存的组件的 key
    const keys = new Set();
    // 当前的组件
    let current = null;
    const instance = currentInstance;
    // 对于 KeepAlive 组件来说。它的实例上存在特殊的 keepAliveCtx 对象 该对象由渲染器注入
    // 该对象会暴露渲染器内部的一些方法，其中 move 函数用来将一段 DOM 移动到另一个容器中
    const { move, unmount, createElement } = instance.KeepAliveCtx;

    // 创建隐藏容器
    const storageContainer = createElement('div');

    // 这两个函数会在渲染器中调用
    instance._deActivate = (vnode) => {
      // 使组件失活
      move(vnode, storageContainer);
    };
    instance._activate = (vnode, container, anchor) => {
      // 激活组件
      move(vnode, container, anchor);
    };

    function pruneCacheEntry (key) {
      cache.delete(key);
      keys.delete(key);
    }

    return () => {
      if (!slots.default) {
        return null;
      }
      // KeepAlive 的默认插槽就是要被 KeepAlive 的组件
      let rawVNode = slots.default();
      // 如果不是组件，直接渲染即可，因为非组件的虚拟节点无法被 KeepAlive
      if (typeof rawVNode !== 'object') {
        return rawVNode;
      }
      const name = rawVNode.type.name;
      if (name && (
        props.include && !props.include.test(name) ||
        props.exclude && props.exclude.test(name)
      )) {
        // 如果组件的 name 无法被 include 匹配，或者被 exclude 匹配，则直接进行渲染，不做缓存
        return rawVNode;
      }
      const key = vnode.key == null ? rawVNode.type : rawVNode.key;
      // 在挂载是先获取缓存的组件 vnode
      const cachedVNode = cache.get(key);
      if (cachedVNode) {
        // 如果有缓存的内容，则说明不应该执行挂载，而应该执行激活
        rawVNode.component = cachedVNode.component;
        // 添加标记 避免被渲染器重新挂载它
        rawVNode.KeepAlive = true;
        // 更新当前 key 为栈中最顶端
        keys.delete(key);
        keys.add(key);
      } else {
        // 添加进缓存中
        // TODO 应在 onMounted、onUpdated 时加入缓存
        cache.set(rawVNode.type, rawVNode);
        keys.add(key);
        if (max && keys.size > parseInt(max, 10)) {
          pruneCacheEntry(keys.values().next().value);
        }
      }
      // 在组件 vnode 上添加标记，避免被渲染器将组件真的卸载
      rawVNode.shouldKeepAlive = true;
      // 将实例挂载到 vnode 上，以便在渲染器中访问
      rawVNode.keepAlineInstance = instance;
      return rawVNode;
    };
  }
};


export const simpleDiffRender = createRenderer(createSimpleDiff).render;
export const doubleEndDiffRender = createRenderer(createDoubleEndDiff).render;
export const fastDiffRender = createRenderer(createFastDiff).render;
export const render = fastDiffRender;
