// 转换根节点
function transformRoot (node) {
  return () => {
    if (node.type !== 'Root') {
      return;
    }
    // 不考虑根节点下存在多个节点的情况
    const vnodeJavaScriptAST = node.children[0].jsNode;
    node.jsNode = createFunctionDecl('render', [], [createReturnStatement(vnodeJavaScriptAST)]);
  };
}

// 转换标签节点
function transformElement (node) {
  return () => {
    if (node.type !== 'Element') {
      return;
    }
    const callExp = createCallExpression('h', [
      createStringLiteral(node.tag)
    ]);
    if (node.children.length === 1) {
      // 只有一个子元素
      callExp.arguments.push(node.children[0].jsNode);
    } else {
      // 包含多个子元素
      callExp.arguments.push(createArrayExpression(node.children.map(c => c.jsNode)));
    }
    node.jsNode = callExp;
  };
}

// 转换文本节点
function transformText (node) {
  if (node.type !== 'Text') {
    return;
  }
  node.jsNode = createStringLiteral(node.content);
}

// 创建 FunctionDecl 节点
function createFunctionDecl (name = '', params = [], body = []) {
  return {
    type: 'FunctionDecl',
    id: createIdentifier(name),
    params,
    body
  };
}

// 创建 ReturnStatement 节点
function createReturnStatement (returnStatement = null) {
  return {
    type: 'ReturnStatement',
    return: returnStatement
  };
}

// 创建 StringLiteral 节点
function createStringLiteral (value = '') {
  return {
    type: 'StringLiteral',
    value
  };
}

// 创建 Identifier 节点
function createIdentifier (name = '') {
  return {
    type: 'Identifier',
    name
  };
}

// 创建 ArrayExpression 节点
function createArrayExpression (elements = []) {
  return {
    type: 'ArrayExpression',
    elements
  };
}

// 创建 CallExpression 节点
function createCallExpression (callee = '', args = []) {
  return {
    type: 'CallExpression',
    callee: createIdentifier(callee),
    arguments: args
  };
}

// 遍历节点
function traverseNode (ast, context) {
  context.currentNode = ast;
  const exitFns = [];
  const transforms = context.nodeTransforms;
  for (let i = 0; i < transforms.length; i++) {
    const onExit = transforms[i](context.currentNode, context);
    if (onExit) {
      exitFns.push(onExit);
    }
    if (!context.currentNode) {
      return;
    }
  }
  const children = context.currentNode.children;
  if (children) {
    context.parent = context.currentNode;
    for (let i = 0; i < children.length; i++) {
      context.childIndex = i;
      traverseNode(children[i], context);
    }
  }
  // 反序执行 退出函数栈中的回调函数
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

// 转换 模版 AST 为 JavaScript AST
export default function transforms (ast) {
  const context = {
    currentNode: null,
    childIndex: 0,
    parent: null,
    replaceNode (node) {
      // 替换节点
      context.parent.children[context.childIndex] = node;
      context.currentNode = node;
    },
    removeNode () {
      if (context.parent) {
        context.parent.children.splice(context.childIndex, 1);
        context.currentNode = null;
      }
    },
    nodeTransforms: [
      transformRoot,
      transformElement,
      transformText
    ]
  };
  traverseNode(ast, context);
}
