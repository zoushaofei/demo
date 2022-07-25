// fastDiff
function diff (n1, n2, container) {
  let loopCount = 0;

  const oldChildren = n1.children;
  const newChildren = n2.children;

  let j = 0;

  let oldEnd = oldChildren.length - 1;
  let newEnd = newChildren.length - 1;

  let oldVNode;
  let newVNode;

  // 1. sync from start
  // (a b) c
  // (a b) d e
  while (j <= oldEnd && j <= newEnd) {
    // 同步头部相同的
    oldVNode = oldChildren[j];
    newVNode = newChildren[j];
    if (oldVNode.key === newVNode.key) {
      diff.patch(oldVNode, newVNode, container);
    } else {
      break;
    }
    j++;

    loopCount++;
  }

  // 2. sync from end
  // a (b c)
  // d e (b c)
  while (j <= oldEnd && j <= newEnd) {
    // 同步尾部相同的
    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];
    if (oldVNode.key === newVNode.key) {
      diff.patch(oldVNode, newVNode, container);
    } else {
      break;
    }
    oldEnd--;
    newEnd--;

    loopCount++;
  }

  // 3. common sequence + mount
  // old: (a b)
  // new: (a b) c
  // j = 2, oldEnd = 1, newEnd = 2
  // old: (a b)
  // new: c (a b)
  // j = 0, oldEnd = -1, newEnd = 0
  if (j > oldEnd && j <= newEnd) {
    // 只有新增的情况
    const anchorIndex = newEnd + 1;
    const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;
    while (j <= newEnd) {
      diff.patch(null, newChildren[j++], container, anchor);

      loopCount++;
    }
  }

  // 4. common sequence + unmount
  // old: (a b) c
  // new: (a b)
  // j = 2, oldEnd = 2, newEnd = 1
  // old: a (b c)
  // new: (b c)
  // j = 0, oldEnd = 0, newEnd = -1
  else if (j > newEnd && j <= oldEnd) {
    // 只有卸载的情况
    while (j <= oldEnd) {
      diff.unmount(oldChildren[j++]);

      loopCount++;
    }
  }
  // 5. unknown sequence
  // [j ... oldEnd + 1]: a b [c d e] f g
  // [j ... newEnd + 1]: a b [e d c h] f g
  // j = 2, oldEnd = 4, newEnd = 5
  else {
    // 包含新增与卸载的情况
    const oldStart = j; // prev starting index
    const newStart = j; // next starting index

    // 5.1 build key:index map for newChildren
    const keyIndex = {};
    for (let i = newStart; i < newEnd; i++) {
      keyIndex[newChildren[i].key] = i;

      loopCount++;
    }

    // 5.2 loop through old children left to be patched and try to patch
    // matching nodes & remove nodes that are no longer present
    const count = newEnd - j + 1;
    const source = new Array(count);
    source.fill(-1);
    let pos = 0;
    let moved = false;
    let patched = false;

    for (let i = oldStart; i <= oldEnd; i++) {
      oldVNode = oldChildren[i];
      if (patched <= count) {
        const k = keyIndex[oldVNode.key];
        if (typeof k !== 'undefined') {
          newVNode = newChildren[k];
          diff.patch(oldVNode, newVNode, container);
          patched++;
          source[k - newStart] = i;
          if (k < pos) {
            moved = true;
          } else {
            pos = k;
          }
        } else {
          diff.unmount(oldVNode);
        }
      } else {
        // all new children have been patched so this can only be a removal
        diff.unmount(oldVNode);
      }

      loopCount++;
    }

    // 5.3 move and mount
    // generate longest stable subsequence only when nodes have moved
    if (moved) {
      const seq = getSequence(source);
      let s = seq.length - 1;
      let i = count - 1;

      // looping backwards so that we can use last patched node as anchor
      for (i; i >= 0; i--) {
        if (source[i] === -1) {
          const pos = i + newStart;
          const newVNode = newChildren[pos];
          const nextPos = pos + 1;
          const anchor = nextPos < newChildren.length
            ? newChildren[nextPos].el
            : null;
          diff.patch(null, newVNode, container, anchor);
        } else if (i !== seq[s]) {
          const pos = i + newStart;
          const newVNode = newChildren[pos];
          const nextPos = pos + 1;
          const anchor = nextPos < newChildren.length
            ? newChildren[nextPos].el
            : null;
          diff.insert(newVNode.el, container, anchor);
        } else {
          s--;
        }

        loopCount++;
      }
    }
  }
  console.log("count", loopCount);
}

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

export default function createDiff (options) {
  return Object.assign(diff, options);
}
