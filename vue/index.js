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
    diff
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

  diff.createElement = createElement;
  diff.setElementText = setElementText;
  diff.createText = createText;
  diff.setText = setText;
  diff.createComment = createComment;
  diff.setComment = setComment;
  diff.insert = insert;
  diff.patchProps = patchProps;

  diff.render = render;
  diff.patch = patch;
  diff.patchElement = patchElement;
  diff.patchChildren = patchChildren;
  diff.mountElement = mountElement;
  diff.unmount = unmount;

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

const createRenderer = diff => createRender({
  diff,
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

// +++++++++++++++++++++++++++++++++++++++++++++++++

loadScript('./vue/simpleDiff.js', (event, { diff }) => {
  const oldNode = {
    type: 'div',
    key: 0,
    props: {
      id: 'foo',
      class: [
        'a',
        { b: true },
        [
          'c',
          { d: false },
          ['e']
        ]
      ],
      onClick: () => {
        alert('clicked');
      }
    },
    children: [
      { type: TYPE_ENUM.COMMENT, children: '0', key: 0 },
      { type: 'p', children: '1', key: 1 },
      { type: 'p', children: '2', key: 2 },
      { type: 'p', children: '3', key: 3 },
      { type: 'p', children: '4', key: 4 }
    ],
  };

  const newNode = {
    type: 'div',
    key: 0,
    props: {
      id: 'bar'
    },
    children: [
      { type: 'p', children: '5', key: 5 },
      { type: TYPE_ENUM.TEXT, children: '0', key: 0 },
      { type: 'p', children: '4', key: 4 },
      { type: 'p', children: '2', key: 2 },
      { type: 'p', children: '1', key: 1 },
      { type: 'p', children: '3', key: 3 }
    ],
  };

  const renderer = createRenderer(diff)

  renderer.render(oldNode, document.querySelector('#simple-diff'));

  setTimeout(() => {
    renderer.render(newNode, document.querySelector('#simple-diff'));
  }, 1000);

  // 简单diff 当前案例 outCount 11 innerCount 20
}, 'simpleDiff');

// +++++++++++++++++++++++++++++++++++++++++++++++++

loadScript('./vue/doubleEndDiff.js', (event, { diff }) => {
  const oldNode = {
    type: 'div',
    key: 0,
    props: {
      id: 'foo',
      class: [
        'a',
        { b: true },
        [
          'c',
          { d: false },
          ['e']
        ]
      ],
      onClick: () => {
        alert('clicked');
      }
    },
    children: [
      { type: TYPE_ENUM.COMMENT, children: '0', key: 0 },
      { type: 'p', children: '1', key: 1 },
      { type: 'p', children: '2', key: 2 },
      { type: 'p', children: '3', key: 3 },
      { type: 'p', children: '4', key: 4 }
    ],
  };

  const newNode = {
    type: 'div',
    key: 0,
    props: {
      id: 'bar'
    },
    children: [
      { type: 'p', children: '5', key: 5 },
      { type: TYPE_ENUM.TEXT, children: '0', key: 0 },
      { type: 'p', children: '4', key: 4 },
      { type: 'p', children: '2', key: 2 },
      { type: 'p', children: '1', key: 1 },
      { type: 'p', children: '3', key: 3 }
    ],
  };

  const renderer = createRenderer(diff)

  renderer.render(oldNode, document.querySelector('#double-end-diff'));

  setTimeout(() => {
    renderer.render(newNode, document.querySelector('#double-end-diff'));
  }, 1000);

  // 双端diff 当前案例 count 5
}, 'doubleEndDiff');

// +++++++++++++++++++++++++++++++++++++++++++++++++

loadScript('./vue/fastDiff.js', (event, { diff }) => {
  const oldNode = {
    type: 'div',
    key: 0,
    props: {
      id: 'foo',
      class: [
        'a',
        { b: true },
        [
          'c',
          { d: false },
          ['e']
        ]
      ],
      onClick: () => {
        alert('clicked');
      }
    },
    children: [
      { type: TYPE_ENUM.COMMENT, children: '0', key: 0 },
      { type: 'p', children: '1', key: 1 },
      { type: 'p', children: '2', key: 2 },
      { type: 'p', children: '3', key: 3 },
      { type: 'p', children: '4', key: 4 }
    ],
  };

  const newNode = {
    type: 'div',
    key: 0,
    props: {
      id: 'bar'
    },
    children: [
      { type: 'p', children: '5', key: 5 },
      { type: TYPE_ENUM.TEXT, children: '0', key: 0 },
      { type: 'p', children: '4', key: 4 },
      { type: 'p', children: '2', key: 2 },
      { type: 'p', children: '1', key: 1 },
      { type: 'p', children: '3', key: 3 }
    ],
  };

  const renderer = createRenderer(diff)

  renderer.render(oldNode, document.querySelector('#fast-diff'));

  setTimeout(() => {
    renderer.render(newNode, document.querySelector('#fast-diff'));
  }, 1000);

  // 快速diff 当前案例 count ？
}, 'fastDiff');

// +++++++++++++++++++++++++++++++++++++++++++++++++
