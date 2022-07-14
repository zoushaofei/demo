var diff = function (n1, n2, container) {

  const oldChildren = n1.children;

  const newChildren = n2.children;

  let lastIndex = 0;

  for (let i = 0; i < newChildren.length; i++) {

    const newVNode = newChildren[i];

    let j = 0;

    let find = false;

    for (j; j < oldChildren.length; j++) {

      const oldVNode = oldChildren[j];

      if (newVNode.key === oldVNode.key) {

        find = true;

        diff.patch(oldVNode, newVNode, container);

        if (j < lastIndex) {

          // console.log('key', newVNode.key, 'lastIndex', lastIndex, 'j', j);

          const prevVNode = newChildren[i - 1];

          if (prevVNode) {

            const anchor = prevVNode.el.nextSibling;

            diff.insert(newVNode.el, container, anchor);

          }

        } else {

          lastIndex = j;

        }

        break;
      }

    }

    if (!find) {

      const prevVNode = newChildren[i - 1];

      let anchor = null;

      if (prevVNode) {

        anchor = prevVNode.el.nextSibling;

      } else {

        anchor = container.firstChild;

      }

      diff.patch(null, newVNode, container, anchor);

    }

  }

  for (let i = 0; i < oldChildren.length; i++) {

    const oldVNode = oldChildren[i];

    const has = newChildren.find(vnode => vnode.key === oldVNode.key);

    if (!has) {

      diff.unmount(oldVNode);

    }

  }

};
