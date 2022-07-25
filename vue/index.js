import { effect, reactive, shallowReactive } from "./reactivity/index.js";
import { queueJob } from "./utils.js";

import createSimpleDiff from "./diff/doubleEndDiff.js";
import createDoubleEndDiff from "./diff/doubleEndDiff.js";
import createFastDiff from "./diff/fastDiff.js";

const TYPE_ENUM = {
  TEXT: Symbol('text'),
  COMMENT: Symbol('comment'),
  FRAGMENT: Symbol('fragment'),
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
      anchor = anchor || n1.el.nextSibling;
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
    } else if (typeof type === 'object') {
      if (!n1) {
        mountComponent(n2, container, anchor);
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
    const componentOptions = vnode.type;
    // 生命周期勾子
    const { render, data, props: propsOptions, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated } = componentOptions;
    beforeCreate && beforeCreate();
    const state = reactive(data());
    const [props, attrs] = resolveProps(propsOptions, vnode.props);
    // 定义组件实例
    const instance = {
      state,
      props: shallowReactive(props),
      isMounted: false,
      subTree: null
    };
    vnode.component = instance;

    // 渲染上下文对象，本质是组件实例的代理
    // 完整的组件还应包含 methods、computed 等选项中定义的数据和方法，这些内容都应在渲染上下文中处理
    const renderContext = new Proxy(instance, {
      get (t, k, r) {
        const { state, props } = t;
        if (state && k in state) {
          return state[k];
        } else if (k in props) {
          return props[k];
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
      if (key in options) {
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

  function hasPropsChanged (prevProps, nextProps) {
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


export const simpleDiffRender = createRenderer(createSimpleDiff).render;
export const doubleEndDiffRender = createRenderer(createDoubleEndDiff).render;
export const fastDiffRender = createRenderer(createFastDiff).render;
export const render = fastDiffRender;
