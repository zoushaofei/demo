var fastDiff = {
  diff: function (n1, n2, container) {
    let loopCount = 0;

    const oldChildren = n1.children;
    const newChildren = n2.children;

    let j = 0;
    let oldVNode = oldChildren[j];
    let newVNode = newChildren[j];

    while (oldVNode.key === newVNode.key) {
      fastDiff.diff.patch(oldVNode, newVNode, container);
      j++;
      oldVNode = oldChildren[j];
      newVNode = newChildren[j];

      loopCount++;
    }

    let oldEnd = oldChildren.length - 1;
    let newEnd = newChildren.length - 1;

    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];

    while (oldVNode.key === newVNode.key) {
      fastDiff.diff.patch(oldVNode, newVNode, container);
      oldVNode = oldChildren[--oldEnd];
      newVNode = newChildren[--newEnd];

      loopCount++;
    }

    if (j > oldEnd && j <= newEnd) {
      const anchorIndex = newEnd + 1;
      const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;
      while (j <= newEnd) {
        fastDiff.diff.patch(oldVNode, newChildren[j++], container, anchor);

        loopCount++;
      }
    } else if (j > newEnd && j <= oldEnd) {
      while (j <= oldEnd) {
        fastDiff.diff.unmount(oldChildren[j++]);

        loopCount++;
      }
    } else {
      const count = newEnd - j + 1;
      const source = new Array(count);
      source.fill(-1);

      const oldState = j;
      const newStart = j;

      let moved = false;
      let pos = 0;

      const keyIndex = {};

      for (let i = newStart; i < newEnd; i++) {
        keyIndex[newChildren[i].key] = i;

        loopCount++;
      }

      let patched = false;

      for (let i = oldState; i <= oldEnd; i++) {
        oldVNode = oldChildren[i];
        if (patched <= count) {
          const k = keyIndex[oldVNode.key];
          if (typeof k !== 'undefined') {
            newVNode = newChildren[k];
            fastDiff.diff.patch(oldVNode, newVNode, container);
            patched++;
            source[k - newStart] = i;
            if (k < pos) {
              moved = true;
            } else {
              pos = k;
            }
          } else {
            fastDiff.diff.unmount(oldVNode);
          }
        } else {
          fastDiff.diff.unmount(oldVNode);
        }

        loopCount++;
      }

      if (moved) {
        const seq = lis(source);
        let s = seq.length - 1;
        let i = count - 1;

        for (i; i >= 0; i--) {
          if (source[i] === -1) {
            const pos = i + newStart;
            const newVNode = newChildren[pos];
            const nextPos = pos + 1;
            const anchor = nextPos < newChildren.length
              ? newChildren[nextPos].el
              : null;
            fastDiff.diff.patch(null, newVNode, container, anchor);
          } else if (i !== seq[s]) {
            const pos = i + newStart;
            const newVNode = newChildren[pos];
            const nextPos = pos + 1;
            const anchor = nextPos < newChildren.length
              ? newChildren[nextPos].el
              : null;
            fastDiff.diff.insert(newVNode.el, container, anchor);
          } else {
            s--;
          }

          loopCount++;
        }
      }
    }
    console.log("count", loopCount);
  }
};

function getSequence (arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = ((u + v) / 2) | 0;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

var lis = getSequence;
