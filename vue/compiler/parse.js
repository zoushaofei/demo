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

// `<div>
// <p id="foo" v-show="display" >text1</p>
// <p>text2</p>
// </div>`

// 递归下降算法构造模版 AST
export function newParse (str = '') {
  console.log(str);
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
  return {
    type: 'root',
    children: nodes
  };
}

function parseChildren (context, ancestors) {
  let nodes = [];
  while (!isEnd(context, ancestors)) {
    const { mode, source } = context;
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
  const { advanceBy, advanceSpace } = context;
  // 例：id="foo" v-show="display" >
  const props = [];

  while (
    !context.source.startsWith('>') &&
    !context.source.startsWith('/>')
  ) {
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
    const name = match[0];
    // 消费属性名
    advanceBy(name.length);
    // 消费无用空白字符
    advanceSpace();
    // 消费等号
    advanceBy(1);
    // 消费等号之后无用空白字符
    advanceSpace();

    let value = '';

    // 获取当前模版内容的第一个字符
    const quote = context.source[0];
    const isQuoted = quote === '"' || quote === "'";
    if (isQuoted) {
      // 消费引号
      advanceBy(1);
      const endQuoteIndex = context.source.indexOf(quote);
      if (endQuoteIndex - 1) {
        value = context.source.slice(0, endQuoteIndex);
        // 消费属性值
        advanceBy(value.length);
        // 消费引号
        advanceBy(1);
      } else {
        // 缺少引号错误
        console.error('缺少引号');
      }
    } else {
      const match = /![^\t\r\n\f >]+/.exec(context.source);
      value = match[0];
      advanceBy(value.length);
    }
    advanceSpace();
    props.push({
      type: 'Attribute',
      name,
      value
    });
  }

  return props;
}

// 解析 插值
function parseInterPolation (context) {
  // 消费开始界定符 {{
  context.advanceBy(2);
  let closeIndex = context.source.indexOf('}}');
  if (closeIndex < 0) {
    console.error('插值缺少结束界定符 }}');
    closeIndex = context.source.length;
  }
  const content = context.source.slice(0, closeIndex);
  context.advanceBy(content.length);
  // 消费结束界定符 }}
  context.advanceBy(2);
  return {
    type: 'InterPolation',
    content: decodeHtml(content)
  };
}

// 解析 注释
function parseComment (context) {
  // 消费开始界定符 <!--
  context.advanceBy(4);
  let closeIndex = context.source.indexOf('-->');
  if (closeIndex < 0) {
    console.error('注释缺少结束界定符 -->');
    closeIndex = context.source.length;
  }
  const content = context.source.slice(0, closeIndex);
  context.advanceBy(content.length);
  // 消费结束界定符 -->
  context.advanceBy(3);
  return {
    type: 'Comment',
    content
  };
}

// 解析 CDATA
function parseCDATA (context, ancestors) {

}

// 解析 文本
function parseText (context) {
  let endIndex = context.source.length;
  const ltIndex = context.source.indexOf('<');
  const delimiterIndex = context.source.indexOf('{{');

  if (ltIndex > -1 && ltIndex < endIndex) {
    endIndex = ltIndex;
  }

  if (delimiterIndex > -1 && delimiterIndex < endIndex) {
    endIndex = delimiterIndex;
  }

  const content = context.source.slice(0, endIndex);

  context.advanceBy(content.length);

  return {
    type: 'Text',
    content: decodeHtml(content)
  };
}

const namedCharacterReferences = {
  'gt': '>',
  'gt;': '>',
  'lt': '<',
  'lt;': '<',
  'ltcc;': '⪦',
};

const CCR_REPLACEMENTS = {
  0x80: 0x20ac,
  0x82: 0x201a,
  0x83: 0x0192,
  0x84: 0x201e,
  0x85: 0x2026,
  0x86: 0x2020,
  0x87: 0x2021,
  0x88: 0x02c6,
  0x89: 0x2030,
  0x8a: 0x0160,
  0x8b: 0x2039,
  0x8c: 0x0152,
  0x8e: 0x017d,
  0x91: 0x2018,
  0x92: 0x2019,
  0x93: 0x201c,
  0x94: 0x201d,
  0x95: 0x2022,
  0x96: 0x2013,
  0x97: 0x2014,
  0x98: 0x02dc,
  0x99: 0x2122,
  0x9a: 0x0161,
  0x9b: 0x203a,
  0x9c: 0x0153,
  0x9e: 0x017e,
  0x9f: 0x0178
};

function decodeHtml (rawText, asAttr = false) {
  let offset = 0;
  const end = rawText.length;
  // 解码后的文本
  let decodedText = '';
  // 引用表 namedCharacterReferences 中实体名称的最大长度
  let maxCRNameLength = 0;
  // 用于消费字符串
  function advance (length) {
    offset += length;
    rawText = rawText.slice(length);
  }

  while (offset < end) {
    // 用于匹配字符串引用的开始部分，如果匹配成功，那么 head[0] 的值将有三种可能
    // 1. head[0] === '&' 命名字符引用
    // 2. head[0] === '&#' 十进制数字字符引用
    // 3. head[0] === '&#x' 16禁止数字字符引用
    const head = /&(?:#x?)?/i.exec(rawText);
    // 没有匹配到，说明没有需要解码的内容了
    if (!head) {
      // 剩余内容长度
      const remaining = end - offset;
      // 将剩余内容加到 decodedText 上
      decodedText += rawText.slice(0, remaining);
      // 消费剩余内容
      advance(remaining);
      break;
    }
    // head.index 为匹配的字符 & 在 rawText 中的位置索引
    // 截取字符 & 之前的内容加到 decodedText 上
    decodedText += rawText.slice(0, head.index);
    // 消费字符 & 之前的内容
    advance(head.index);

    // 命名字符引用
    if (head[0] === '&') {
      let name = '';
      let value;
      // 字符 & 的下一个字符必须是 ASCII 字母或数字，这样才是合法的命名字符引用
      if (/[0-9a-z]/i.test(rawText[1])) {
        if (!maxCRNameLength) {
          maxCRNameLength = Object.keys(namedCharacterReferences)
            .reduce((max, name) => Math.max(max, name.length), 0);
        }
        for (let length = maxCRNameLength; !value && length > 0; --length) {
          name = rawText.substr(1, length);
          // 使用实体名称去索引表中查找对应的值
          value = namedCharacterReferences[name];
        }
        if (value) {
          const semi = name.endsWith(';');
          // 如果实体名称的文本作为属性值，最后一个匹配的字符不是分号
          // 并且最后一个匹配的字符的下一个字符是等于号（=）、ASCII 字符或数字，
          // 由于历史原因，将字符 & 和实体名称 name 作为普通文本
          if (asAttr && !semi && /[=a-z0-9]/i.test(rawText[name.length + 1] || '')) {
            decodedText += '&' + name;
            advance(name.length + 1);
          } else {
            // 使用解码的值
            decodedText += value;
            advance(name.length + 1);
          }
        } else {
          // 解码失败
          decodedText += '&' + name;
          advance(name.length + 1);
        }
      } else {
        decodedText += '&';
        advance(1);
      }
    } else {
      // 数字字符引用
      const hex = head[0] === '&#x';
      const pattern = hex ? /^&#x([0-9a-f])+;?/ : /^&#([0-9])+;?/;
      const body = pattern.exec(rawText);
      console.log(body);
      if (body) {
        // 转换为数字
        let cp = Number.parseInt(body[1], hex ? 16 : 10);
        // 码点合法性检测
        if (cp === 0) {
          // 如果码点值为 0x00 ，替换为 0xfffd
          cp = 0xfffd;
        } else if (cp > 0x10ffff) {
          // 如果码点值超过 Unicode 的最大值，替换为 0xfffd
          cp = 0xfffd;
        } else if (cp >= 0xd800 && cp <= 0xdfff) {
          // 如果码点值处于 surrogate pair 范围内，替换为 0xfffd
          cp = 0xfffd;
        } else if ((cp >= 0xfdd0 && cp <= 0xfdef) || (cp & 0xfffe) === 0xfffe) {
          // 如果码点值处于 noncharacter 范围内，则什么都不做，交给平台处理
          // noop
        } else if (
          // 控制字符集的范围是：[0x01,0x1f] 加上 [0x7f,0x9f]
          // 去掉 ASICC 空白符：0x09(TAB)、ox0A(LF)、0x0C(FF)
          // 0x0D(CR) 虽然也是 ASICC 空白符，但需要包含
          (cp >= 0x01 && cp <= 0x08) ||
          cp === 0x0b ||
          (cp >= 0x0d && cp <= 0x1f) ||
          (cp >= 0x7f && cp <= 0x9f)
        ) {
          cp = CCR_REPLACEMENTS[cp] || cp;
        }
        decodedText += String.fromCodePoint(cp);
        advance(body[0].length);
      } else {
        // 未匹配，不进行解码
        decodedText += head[0];
        advance(head[0].length);
      }
    }
  }

  return decodedText;
}