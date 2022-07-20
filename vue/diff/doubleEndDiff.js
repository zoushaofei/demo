// doubleEndDiff
function diff (n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;

  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;

  let oldStartVNode = oldChildren[oldStartIdx];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[newStartIdx];
  let newEndVNode = newChildren[newEndIdx];

  let count = 0;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode.key === newStartVNode.key) {
      diff.patch(oldStartVNode, newStartVNode, container);
      oldStartVNode = oldChildren[++oldStartIdx];
      newStartVNode = newChildren[++newStartIdx];
    } else if (oldEndVNode.key === newEndVNode.key) {
      diff.patch(oldEndVNode, newEndVNode, container);
      oldEndVNode = oldChildren[--oldEndIdx];
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldStartVNode.key === newEndVNode.key) {
      diff.patch(oldStartVNode, newEndVNode, container);
      diff.insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling);
      oldStartVNode = oldChildren[++oldStartIdx];
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldEndVNode.key === newStartVNode.key) {
      diff.patch(oldEndVNode, newStartVNode, container);
      diff.insert(oldEndVNode.el, container, oldStartVNode.el);
      oldEndVNode = oldChildren[--oldEndIdx];
      newStartVNode = newChildren[++newStartIdx];
    } else {
      const idxInOld = oldChildren.findIndex(node => node.key === newStartVNode.key);
      if (idxInOld > 0) {
        const vnodeTMove = oldChildren[idxInOld];
        diff.patch(vnodeTMove, newStartVNode, container);
        diff.insert(vnodeTMove.el, container, oldStartVNode.el);
        oldChildren[idxInOld] = undefined;
      } else {
        diff.patch(null, newStartVNode, container, oldStartVNode.el);
      }
      newStartVNode = newChildren[++newStartIdx];
    }
    count++;
  }
  if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      doubleEndDiff.diff.patch(null, newChildren[i], container, oldStartVNode.el);
      count++;
    }
  }
  console.log("count", count);
}

export default function createDiff (options) {
  return Object.assign(diff, options);
}
