function ListNode (val, next) {
  this.val = (val === undefined ? 0 : val)
  this.next = (next === undefined ? null : next)
}

var createListNode = function (list = []) {
  const head = new ListNode()
  let node = head
  for (let i = 0; i < list.length; i++) {
    node.val = list[i];
    if (i < list.length - 1) {
      node.next = new ListNode()
      node = node.next
    }
  }
  return head
}

/*
 * @lc app=leetcode.cn id=1 lang=javascript
 *
 * [1] 两数之和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
  const temp = {}
  for (let i = 0; i < nums.length; i++) {
    const wanted = target - nums[i]
    if (temp[wanted] !== undefined) {
      return [temp[wanted], i]
    } else {
      temp[nums[i]] = i
    }
  }
};

// =================================================================

/*
 * @lc app=leetcode.cn id=2 lang=javascript
 *
 * [2] 两数相加
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2) {
  const result = new ListNode()
  let node = result
  while (node) {
    let sum = node.val
    if (l1 && l2) {
      sum += (l1.val + l2.val)
      l1 = l1.next
      l2 = l2.next
    } else if (l1) {
      sum += l1.val
      l1 = l1.next
    } else if (l2) {
      sum += l2.val
      l2 = l2.next
    }
    if (sum > 9) {
      const sumStr = (sum + '')
      node.val = Number(sumStr[sumStr.length - 1])
      node.next = new ListNode()
      node.next.val = Number(sumStr.slice(0, sumStr.length - 1))
      node = node.next
    } else {
      node.val = sum
      if (l1 || l2) {
        node.next = new ListNode()
        node = node.next
      } else {
        node = null
      }
    }
  }
  return result
}

// =================================================================

/*
 * @lc app=leetcode.cn id=3 lang=javascript
 *
 * [3] 无重复字符的最长子串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  let max = 0
  let count = 0
  let temp = {}
  for (let i = 0; i < s.length; i++) {
    console.log(s[i])
    if (temp[s[i]]) {
      temp = {}
      i = i - count
      if (s.length - i < max) {
        max = count > max ? count : max
        break
      }
      count = 0
    } else {
      count++
      temp[s[i]] = true
    }
    max = count > max ? count : max
  }
  return max
};

/**
 * var lengthOfLongestSubstring = function (s) {
 *   // 哈希集合，记录每个字符是否出现过
 *   const occ = new Set();
 *   const n = s.length;
 *   // 右指针，初始值为 -1，相当于我们在字符串的左边界的左侧，还没有开始移动
 *   let rk = -1, ans = 0;
 *   for (let i = 0; i < n; ++i) {
 *     if (i != 0) {
 *       // 左指针向右移动一格，移除一个字符
 *       occ.delete(s.charAt(i - 1));
 *     }
 *     while (rk + 1 < n && !occ.has(s.charAt(rk + 1))) {
 *       // 不断地移动右指针
 *       occ.add(s.charAt(rk + 1));
 *       ++rk;
 *     }
 *     // 第 i 到 rk 个字符是一个极长的无重复字符子串
 *     ans = Math.max(ans, rk - i + 1);
 *   }
 *   return ans;
 * };
 */

// =================================================================

/*
 * @lc app=leetcode.cn id=4 lang=javascript
 *
 * [4] 寻找两个正序数组的中位数
 */

// @lc code=start
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function (nums1, nums2) {
  const nums = [...nums1, ...nums2].sort((a, b) => a - b)
  if (nums.length % 2) {
    return nums[Math.floor(nums.length / 2)]
  } else {
    let mid = nums.length / 2
    return (nums[mid] + nums[mid - 1]) / 2
  }
};

// =================================================================

/*
 * @lc app=leetcode.cn id=5 lang=javascript
 *
 * [5] 最长回文子串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {string}
*/
var longestPalindrome = function (s) {
  if (s.length <= 1) {
    return s
  }

  let start = 0
  let end = 0
  for (let i = 0; i < s.length; i++) {
    if (i + (end - start) / 2 >= s.length - 1) {
      // console.log('break')
      break
    }
    let len1 = expandAroundCenter(s, i, i)
    let len2 = expandAroundCenter(s, i, i + 1)
    let len = Math.max(len1, len2)
    if (len > end - start) {
      if (len % 2) {
        start = i - (len - 1) / 2
        end = i + (len - 1) / 2
      } else {
        start = i - len / 2 + 1
        end = i + len / 2
      }
    }
  }
  return s.substring(start, end + 1)
};

var expandAroundCenter = function (s, left, right) {
  // 从中心展开的最长回文字长度
  while (left >= 0 && right < s.length && s[left] == s[right]) {
    --left
    ++right
  }
  return right - left - 1
}

// =================================================================

/*
 * @lc app=leetcode.cn id=6 lang=javascript
 *
 * [6] Z 字形变换
 */

// @lc code=start
/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function (s, numRows) {
  if (numRows === 1) {
    return s
  }
  let count = 0
  let strArr = new Array(numRows).fill('')
  let direction = 1
  for (let i = 0; i < s.length; i++) {
    if (count >= numRows - 1) {
      direction = -1
    } else if (count <= 0) {
      direction = 1
    }
    strArr[count] += s[i]
    count += direction
  }
  return strArr.join('')
};

// =================================================================



// =================================================================

/*
 * @lc app=leetcode.cn id=8 lang=javascript
 *
 * [8] 字符串转换整数 (atoi)
 */

// @lc code=start
/**
 * @param {string} s
 * @return {number}
 */
// var myAtoi = function (s) {
//   let symbol = 1
//   let hasNum = false
//   let hasSign = false
//   let hasPoint = false
//   const sign = ['-', '+']
//   let numStr = ''
//   for (let i = 0; i < s.length; i++) {
//     if (/\d/.test(s[i])) {
//       hasNum = true
//       numStr += s[i]
//     } else if (sign.includes(s[i])) {
//       if (!hasNum && !hasSign) {
//         hasSign = true
//         symbol = s[i] === '-' ? -1 : 1
//       } else {
//         break
//       }
//     } else if (s[i] === '.') {
//       if (hasNum && !hasPoint) {
//         hasPoint = true
//         numStr += s[i]
//       } else {
//         break
//       }
//     } else if (s[i] === ' ' && !(hasNum || hasSign || hasPoint)) {
//       continue
//     } else if (s[i] !== ' ' || hasNum || hasSign || hasPoint) {
//       break
//     }
//   }
//   const res = numStr * symbol
//   if (res < -Math.pow(2, 31)) return -Math.pow(2, 31)
//   if (res > (Math.pow(2, 31) - 1)) return Math.pow(2, 31) - 1
//   return res
// };
var myAtoi = function (s) {
  const matched = s.match(/^ *([-\+]?)(\d+)/)
  if (matched && matched[2]) {
    let symbol = matched[1] === '-' ? -1 : 1
    const res = matched[2] * symbol
    if (res < -Math.pow(2, 31)) return -Math.pow(2, 31)
    if (res > (Math.pow(2, 31) - 1)) return Math.pow(2, 31) - 1
    return res
  }
  return 0
};
// myAtoi("+-12")

// =================================================================

/*
 * @lc app=leetcode.cn id=9 lang=javascript
 *
 * [9] 回文数
 */

// @lc code=start
/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function (x) {
  x = x + ''
  const len = Math.floor(x.length / 2)
  for (let i = 0; i < len; i++) {
    if (x[i] !== x[x.length - 1 - i]) {
      return false
    }
  }
  return true
};

// =================================================================



// =================================================================

/*
 * @lc app=leetcode.cn id=11 lang=javascript
 *
 * [11] 盛最多水的容器
 */

// @lc code=start
/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function (height) {
  let max = 0
  let l = 0
  let r = height.length - 1
  while (l < r) {
    max = Math.max(max, Math.min(height[l], height[r]) * (r - l))
    if (height[l] < height[r]) {
      l++
    } else if (height[l] > height[r]) {
      r--
    } else {
      l++
    }
  }
  return max
};

// =================================================================

/*
 * @lc app=leetcode.cn id=12 lang=javascript
 *
 * [12] 整数转罗马数字
 */

// @lc code=start
/**
 * @param {number} num
 * @return {string}
 */
var intToRoman = function (num) {
  let nums = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
  let values = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
  let str = ''
  for (let i = 0; i < 13; i++) {
    while (num >= nums[i]) {
      num -= nums[i];
      str += values[i];
    }
  }
  return str
};

// =================================================================

/*
 * @lc app=leetcode.cn id=13 lang=javascript
 *
 * [13] 罗马数字转整数
 */

// @lc code=start
/**
 * @param {string} s
 * @return {number}
 */
var romanToInt = function (s) {
  let values = { "M": 1000, "D": 500, "C": 100, "L": 50, "X": 10, "V": 5, "I": 1 }
  let num = 0
  for (let i = 0; i < s.length; i++) {
    let value = values[s[i]]
    if (s[i + 1] && value < values[s[i + 1]]) {
      num -= value
    } else {
      num += value
    }
  }
  return num
};
// romanToInt("LVIII")

// =================================================================

/*
 * @lc app=leetcode.cn id=14 lang=javascript
 *
 * [14] 最长公共前缀
 */

// @lc code=start
/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function (strs) {
  if (strs.length <= 1) {
    return strs[0]
  }
  strs.sort((a, b) => a.length - b.length)
  let publicPrefix = ''
  let count = 1
  if (strs[0].length) {
    let str = strs[0].slice(0, count)
    while (strs.every(s => s.startsWith(str))) {
      publicPrefix = str
      if (count < strs[0].length) {
        str = strs[0].slice(0, ++count)
      } else {
        break
      }
    }
  }
  return publicPrefix
};
// longestCommonPrefix(["ab", "a"])

// =================================================================

/*
 * @lc app=leetcode.cn id=15 lang=javascript
 *
 * [15] 三数之和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
  let res = []
  nums.sort((a, b) => a - b)
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      continue
    }
    let l = i + 1
    let r = nums.length - 1
    while (l < r) {
      if (nums[i] + nums[l] + nums[r] === 0) {
        res.push([nums[i], nums[l], nums[r]])
        while (l < r) {
          l++;
          if (nums[l - 1] != nums[l]) break;
        }
        while (l < r) {
          r--;
          if (nums[r + 1] != nums[r]) break;
        }
      } else if (nums[i] + nums[l] + nums[r] < 0) {
        l++
      } else if (nums[i] + nums[l] + nums[r] > 0) {
        r--
      }
    }
  }
  return res
};

// =================================================================

/*
 * @lc app=leetcode.cn id=16 lang=javascript
 *
 * [16] 最接近的三数之和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var threeSumClosest = function (nums, target) {
  nums.sort((a, b) => a - b)
  let difference = Number.MAX_VALUE
  let res
  for (let i = 0; i < nums.length; i++) {
    let l = i + 1
    let r = nums.length - 1
    while (l < r) {
      let sum = nums[i] + nums[l] + nums[r]
      if (sum === target) {
        return sum
      } else {
        let def = Math.abs(target - sum)
        if (def < difference) {
          res = sum
          difference = def
        }
        if (sum < target) {
          l++
        } else if (sum > target) {
          r--
        }
      }
    }
  }
  return res
};

// =================================================================

/*
 * @lc app=leetcode.cn id=17 lang=javascript
 *
 * [17] 电话号码的字母组合
 */

// @lc code=start
/**
 * @param {string} digits
 * @return {string[]}
 */
var letterCombinations = function (digits) {
  if (!digits) {
    return []
  }
  const dic = {
    2: ['a', 'b', 'c'],
    3: ['d', 'e', 'f'],
    4: ['g', 'h', 'i'],
    5: ['j', 'k', 'l'],
    6: ['m', 'n', 'o'],
    7: ['p', 'q', 'r', 's'],
    8: ['t', 'u', 'v'],
    9: ['w', 'x', 'y', 'z']
  }
  let res = [...dic[digits[0]]]
  for (let i = 1; i < digits.length; i++) {
    const arr = []
    res.forEach(e => arr.push(...dic[digits[i]].map(d => e + d)))
    res = arr
  }
  return res
};

// =================================================================

/*
 * @lc app=leetcode.cn id=18 lang=javascript
 *
 * [18] 四数之和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function (nums, target) {
  let res = []
  nums.sort((a, b) => a - b)
  for (let i = 0; i < nums.length - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      continue
    }
    for (let j = i + 1; j < nums.length - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) {
        continue
      }
      let l = j + 1
      let r = nums.length - 1
      while (l < r) {
        if (nums[i] + nums[j] + nums[l] + nums[r] === target) {
          res.push([nums[i], nums[j], nums[l], nums[r]])
          while (l < r) {
            l++;
            if (nums[l - 1] != nums[l]) break;
          }
          while (l < r) {
            r--;
            if (nums[r + 1] != nums[r]) break;
          }
        } else if (nums[i] + nums[j] + nums[l] + nums[r] < target) {
          l++
        } else if (nums[i] + nums[j] + nums[l] + nums[r] > target) {
          r--
        }
      }
    }
  }
  return res
};

// =================================================================

/*
 * @lc app=leetcode.cn id=19 lang=javascript
 *
 * [19] 删除链表的倒数第 N 个结点
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function (head, n) {
  let stack = []
  let node = head
  while (node) {
    stack.push(node)
    node = node.next
  }
  let index = stack.length - n
  if (index > 0) {
    stack[index - 1].next = stack[index - 1].next.next
  } else {
    head = head.next
  }
  return head
};
// removeNthFromEnd(createListNode([1, 2, 3, 4, 5]), 2)

// =================================================================

/*
 * @lc app=leetcode.cn id=20 lang=javascript
 *
 * [20] 有效的括号
 */

// @lc code=start
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
  let stack = []
  const lBracket = ['(', '[', '{']
  const rBracket = {
    ')': '(',
    ']': '[',
    '}': '{'
  }
  for (let i = 0; i < s.length; i++) {
    if (lBracket.includes(s[i])) {
      stack.push(s[i])
    } else {
      if (stack.length && rBracket[s[i]] === stack[stack.length - 1]) {
        stack.pop()
      } else {
        return false
      }
    }
  }
  return stack.length === 0
};

// =================================================================

/*
 * @lc app=leetcode.cn id=21 lang=javascript
 *
 * [21] 合并两个有序链表
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function (list1, list2) {
  if (!list1) {
    return list2
  }
  if (!list2) {
    return list1
  }
  let res
  let other
  if (list1.val < list2.val) {
    res = list1
    other = list2
  } else {
    res = list2
    other = list1
  }
  res.next = mergeTwoLists(res.next, other)
  return res
};
mergeTwoLists(createListNode([1, 2, 4]), createListNode([1, 3, 4]))

// =================================================================

/*
 * @lc app=leetcode.cn id=22 lang=javascript
 *
 * [22] 括号生成
 */

// @lc code=start
/**
 * @param {number} n
 * @return {string[]}
 */
var generateParenthesis = function (n) {
};

// =================================================================

/*
 * @lc app=leetcode.cn id=23 lang=javascript
 *
 * [23] 合并K个升序链表
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
var mergeKLists = function (lists) {
  const head = new ListNode()
  lists = lists.filter(n => n)
  if (lists.length) {
    let node = head
    let isContinue = lists.length
    while (isContinue > 0) {
      let index = 0
      for (let i = 1; i < lists.length; i++) {
        index = lists[index].val < lists[i].val ? index : i
      }
      node.next = lists[index]
      node = node.next
      if (lists[index].next) {
        lists[index] = lists[index].next
      } else {
        lists.splice(index, 1)
        isContinue--
      }
    }
  }
  return head.next
};
mergeKLists([createListNode([1, 4, 5]), createListNode([1, 3, 4]), createListNode([2, 6])])

// =================================================================

/*
 * @lc app=leetcode.cn id=24 lang=javascript
 *
 * [24] 两两交换链表中的节点
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var swapPairs = function (head) {
  if (head == null || head.next == null) {
    return head;
  }
  const next = head.next;
  head.next = swapPairs(next.next);
  next.next = head;
  return next;
};

// =================================================================



// =================================================================

/*
 * @lc app=leetcode.cn id=26 lang=javascript
 *
 * [26] 删除有序数组中的重复项
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function (nums) {
  const n = nums.length;
  if (n < 2) {
    return n;
  }
  // let fast = 1, slow = 1;
  // while (fast < n) {
  //   if (nums[fast] !== nums[fast - 1]) {
  //     nums[slow] = nums[fast];
  //     ++slow;
  //   }
  //   ++fast;
  // }
  let fast = 1, slow = 0;
  while (fast < n) {
    if (nums[fast] !== nums[slow]) {
      if (fast - slow > 1) {
        nums[slow + 1] = nums[fast];
      }
      ++slow;
    }
    ++fast;
  }
  return slow;
};
// removeDuplicates([1, 2, 2, 2, 3, 4, 4, 5, 6])

// =================================================================

/*
 * @lc app=leetcode.cn id=27 lang=javascript
 *
 * [27] 移除元素
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 */
var removeElement = function (nums, val) {
  // const n = nums.length;
  // if (n < 1) {
  //   return n;
  // } else if (n < 2) {
  //   return nums[0] === val ? 0 : 1
  // }
  // let fast = 1, slow = 0, count = nums[0] === val ? 1 : 0;
  // while (fast < n) {
  //   if (nums[fast] === val) {
  //     ++count
  //   }
  //   if (nums[slow] !== val) {
  //     ++slow
  //   } else if (nums[fast] !== val) {
  //     nums[slow] = nums[fast]
  //     nums[fast] = val
  //     ++slow
  //   }
  //   ++fast
  // }
  // return n - count

  // const n = nums.length;
  // let left = 0;
  // for (let right = 0; right < n; right++) {
  //   if (nums[right] !== val) {
  //     nums[left] = nums[right];
  //     left++;
  //   }
  // }
  // return left;

  const n = nums.length
  let l = 0, r = 0
  while (r < n) {
    console.log('l:', l, 'r:', r)
    if (nums[r] !== val) {
      nums[l] = nums[r]
      l++
    }
    r++
    console.log(nums)
  }
  console.log('nums')
  return l
};
// removeElement([3, 2, 3, 2, 4, 3, 4], 3)
// removeElement([3, 3, 4, 3,], 3)
// removeElement([3, 3, 3, 3, 3], 5)
// removeElement([1, 2, 3, 4], 3)

// =================================================================

/*
 * @lc app=leetcode.cn id=28 lang=javascript
 *
 * [28] 实现 strStr()
 */

// @lc code=start
/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 */
var strStr = function (haystack, needle) {
  const hLen = haystack.length
  const nLen = needle.length
  if (hLen < nLen) {
    return -1
  } else if (hLen === nLen) {
    return haystack === needle ? 0 : -1
  }
  // for (let i = 0; i < hLen; i++) {
  //   if (hLen - i >= nLen) {
  //     let j = nLen - 1
  //     while (j >= 0) {
  //       if (haystack[i + j] === needle[j]) {
  //         if (j === 0) {
  //           return i
  //         }
  //         j--
  //       } else {
  //         break
  //       }
  //     }
  //   } else {
  //     return -1
  //   }
  // }

  for (let i = 0; i <= hLen - nLen; i++) {
    let j = 0
    while (j < nLen) {
      if (haystack[i + j] === needle[j]) {
        if (j === nLen - 1) {
          return i
        }
        j++
      } else {
        break
      }
    }
  }
  return -1
};
// console.log(strStr("helllo", "lll"))

// =================================================================

/*
 * @lc app=leetcode.cn id=29 lang=javascript
 *
 * [29] 两数相除
 */

// @lc code=start
/**
 * @param {number} dividend
 * @param {number} divisor
 * @return {number}
 */
var divide = function (dividend, divisor) {
  const sign = dividend < 0 ? divisor < 0 ? 1 : -1 : divisor < 0 ? -1 : 1
  dividend = Math.abs(dividend)
  divisor = Math.abs(divisor)
  let quotient
  if (divisor === 1) {
    quotient = dividend
  } else {
    quotient = 0
    while (dividend >= divisor) {
      quotient++
      dividend -= divisor
    }
  }
  const res = quotient * sign
  const max = Math.pow(2, 31) - 1
  const min = -Math.pow(2, 31)
  return res > max ? max : res < min ? min : res
};
// divide(-2147483648, -3)

// =================================================================

/*
 * @lc app=leetcode.cn id=30 lang=javascript
 *
 * [30] 串联所有单词的子串
 */

// @lc code=start
/**
 * @param {string} s
 * @param {string[]} words
 * @return {number[]}
 */
var findSubstring = function (s, words) {
  const wLen = words.length
  const wsLen = words[0].length
  const sLen = s.length
  if (wsLen > sLen) {
    return []
  }
  let tempAoo = [];
  for (let i = 0; i < sLen - wsLen; i++) {
    tempAoo[i] = words.indexOf(s.slice(i, i + wsLen))
    if (tempAoo[i] > -1 && i >= wsLen * (wLen - 1)) {
      let len = 0
      let index
      const tempObj = { [i]: true }
      while (len <= wLen) {
        if (tempAoo[i - (len + 1) * wsLen] && !tempObj[i - len * wsLen]) {
          tempObj[i - len * wsLen] = true
          len++
        } else {
          break
        }
      }
      if (len === wLen) {
        console.log(index)
      }
    }
  }
  console.log(tempAoo)
};
findSubstring("barfoothefoobarman", ["foo", "bar"])

// =================================================================



// =================================================================



// =================================================================



// =================================================================



// =================================================================



// =================================================================



// =================================================================
