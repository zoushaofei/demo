const State = {
  initial: 1,
  tagOpen: 2,
  tagName: 3,
  text: 4,
  tagEnd: 5,
  tagEndName: 6
};

// 对模版进行标记
function tokenize (str) {
  // 有限状态自动机
  // 当前状态：初始状态
  let currentState = State.initial;
  // 用于缓存字符
  const chars = [];
  // 储存生成的 token，并最终返回
  const tokens = [];
  // 使用 while 循环开启自动机
  let len = str.length;
  let otherChars = [];
  let count = 0;
  while (str) {
    if (++count > 100) {
      break;
    }
    const char = str[0];
    switch (currentState) {
      case State.initial:
        if (char === '<') {
          currentState = State.tagOpen;
          str = str.slice(1);
        } else if (isAlpha(char)) {
          currentState = State.text;
          chars.push(char);
          str = str.slice(1);
        }
        break;
      case State.tagOpen:
        if (isAlpha(char)) {
          currentState = State.tagName;
          chars.push(char);
          str = str.slice(1);
        } else if (char === '/') {
          currentState = State.tagEnd;
          str = str.slice(1);
        }
        break;
      case State.tagName:
        if (isAlpha(char)) {
          chars.push(char);
          str = str.slice(1);
        } else if (char === '>') {
          currentState = State.initial;
          tokens.push({
            type: 'tag',
            name: chars.join('')
          });
          chars.length = 0;
          str = str.slice(1);
        }
        break;
      case State.text:
        if (isAlpha(char)) {
          chars.push(char);
          str = str.slice(1);
        } else if (char === '<') {
          currentState = State.tagOpen;
          tokens.push({
            type: 'text',
            content: chars.join('')
          });
          chars.length = 0;
          str = str.slice(1);
        }
        break;
      case State.tagEnd:
        if (isAlpha(char)) {
          currentState = State.tagEndName;
          chars.push(char);
          str = str.slice(1);
        }
        break;
      case State.tagEndName:
        if (isAlpha(char)) {
          chars.push(char);
          str = str.slice(1);
        } else if (char === '>') {
          currentState = State.initial;
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          });
          chars.length = 0;
          str = str.slice(1);
        }
        break;
    }
    if (len === str.length) {
      otherChars.push(char);
      str = str.slice(1);
    } else if (otherChars.length) {
      tokens.push({
        type: 'other',
        content: otherChars.join('')
      });
      otherChars.length = 0;
    }
    len = str.length;
  }

  return tokens;
}

function isAlpha (char) {
  return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z';
}

// 构建 模版 AST 树
export default function parse (str) {
  const tokens = tokenize(str);
  // 根节点
  const root = {
    type: 'Root',
    children: []
  };
  // 节点栈
  const elementStack = [root];

  while (tokens.length) {
    const parent = elementStack[elementStack.length - 1];
    const t = tokens[0];
    switch (t.type) {
      case 'tag':
        const elementNode = {
          type: 'Element',
          tag: t.name,
          children: []
        };
        parent.children.push(elementNode);
        elementStack.push(elementNode);
        break;
      case 'text':
        const textNode = {
          type: 'Text',
          content: t.content
        };
        parent.children.push(textNode);
        break;
      case 'tagEnd':
        elementStack.pop();
        break;
    }
    tokens.shift();
  }
  return root;
}


const TextModes = {
  DATA: 'DATA',
  RCDATA: 'RCDATA',
  RAWTEXT: 'RAWTEXT',
  CDATA: 'CDATA',
};

// 递归下降算法构造模版 AST
function p (str = '') {
  const context = {
    // 模版内容
    source: str,
    // 当前解析器文本模式
    mode: TextModes.DATA,
    // 消费指定的字符串
    advanceBy (num = 0) {
      context.source = context.source.slice(num);
    },
    // 无论是开始标签还是结束标签，都可能存在无用的空白字符，例如 <div   >
    advanceSpace () {
      const match = /^[\t\r\n\f ]+/.exec(context.source);
      if (match) {
        context.advanceBy(match[0].length);
      }
    }
  };
  const nodes = parseChildren(context, []);

  console.log(nodes);
  return {
    type: 'root',
    children: nodes
  };
}

function parseChildren (context, ancestors) {
  let nodes = [];
  const { mode, source } = context;
  while (!isEnd(context, ancestors)) {
    let node;
    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      if (mode === TextModes.DATA && source[0] === '<') {
        if (source[1] === '!') {
          if (source.startsWith('<!--')) {
            // 注释
            node = parseComment(context);
          } else if (source.startsWith('<![CDATA[')) {
            // CDATA
            node = parseCDATA(context, ancestors);
          }
        } else if (source[1] === '/') {
          // 状态机遭遇了无效的闭合标签，此时应抛出错误，因为它缺少与之对应的开始标签
          console.error('无效的闭合标签');
          continue;
        } else if (/[a-z]/i.test(source[1])) {
          // 标签
          node = parseElement(context, ancestors);
        }
      } else if (source.startsWith('{{')) {
        // 插值
        node = parseInterPolation(context);
      }
    }
    if (!node) {
      // 文本
      node = parseText(context);
    }
    nodes.push(node);
  }
  return nodes;
}

function isEnd (context, ancestors) {
  if (!context.source) {
    return true;
  }
  for (let i = ancestors.length - 1; i >= 0; --i) {
    // 只要栈中存在与当前结束标签相同名的节点，就停止状态机
    // <div><span></div></span>
    if (context.source.startsWith(`</${ancestors[i].tag}>`)) {
      return true;
    }
  }
}

// 解析 注释
function parseComment (context) {

}

// 解析 CDATA
function parseCDATA (context, ancestors) {

}

// 解析 标签
function parseElement (context, ancestors) {
  const element = parseTag(context);
  // 自闭和标签
  if (element.isSelfClosing) {
    return element;
  }
  // 切换到正确的文本模式
  if (element.tag === 'textarea' || element.tag === 'title') {
    context.mode = TextModes.RCDATA;
  } else if (/style|xmp|iframe|noembed|noframes|noscript/.test(element.tag)) {
    context.mode = TextModes.RAWTEXT;
  } else {
    context.mode = TextModes.DATA;
  }
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();
  if (context.source.startsWith(`</${element.tag}>`)) {
    parseTag(context, 'end');
  } else {
    // 缺少闭合标签
    console.error(`${element.tag} 标签缺少闭合标签`);
  }
  return element;
}

// 处理起始和结束标签
function parseTag (context, type = 'start') {
  const { advanceBy, advanceSpace } = context;

  const match = type === 'start'
    ? /^<([a-z][^\t\r\n\f />]*)/i.exec(context.source)
    : /^<\/([a-z][^\t\r\n\f />]*)/i.exec(context.source);
  const tag = match[1];
  /**
   * 例：<div>
   * 例：<div/>
   * 例：<div    >
   * 例：<div    />
   */
  advanceBy(match[0].length);
  // 消费空格换行等无用字符串
  advanceSpace();
  // 解析属性与指令
  // props 是由指令节点与属性节点共同组成的数组
  const props = parseAttributes(context);
  const isSelfClosing = context.source.startsWith('/>');
  // 如果是闭合标签 则消费 /> ，否则消费 >
  advanceBy(isSelfClosing ? 2 : 1);
  return {
    type: 'Element',
    tag,
    props,
    children: [],
    isSelfClosing
  };
}

// 解析 属性与指令
function parseAttributes (context) {
  // 例：id="foo" v-show="display" >
  const props = [];

  // while (
  //   !context.source.startsWith('>') &&
  //   !context.source.startsWith('/>')
  // ) {
  //   const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
  //   const name = match[0]
  // }
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
  console.log(match)

  return props;
}

// 解析 插值
function parseInterPolation (context) {

}

// 解析 文本
function parseText (context) {

}

p(`<div>
  <p>text1</p>
  <p>text2</p>
</div>`);