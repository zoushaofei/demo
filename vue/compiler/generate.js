// 生成代码
function genNode (node, context) {
  switch (node.type) {
    case 'FunctionDecl':
      genFunctionDecl(node, context);
      break;
    case 'ReturnStatement':
      genReturnStatement(node, context);
      break;
    case 'CallExpression':
      genCallExpression(node, context);
      break;
    case 'StringLiteral':
      genStringLiteral(node, context);
      break;
    case 'ArrayExpression':
      genArrayExpression(node, context);
      break;
  }
}

function genFunctionDecl (node, context) {
  const { push, indent, deIndent } = context;
  push(`function ${node.id.name} `);
  push('(');
  genNodeList(node.params, context);
  push(') ');
  push('{');
  indent();
  node.body.forEach(n => genNode(n, context));
  deIndent();
  push('}');
}

function genReturnStatement (node, context) {
  const { push } = context;
  push('return ');
  genNode(node.return, context);
}

function genCallExpression (node, context) {
  const { push } = context;
  const { callee, arguments: args } = node;
  push(`${callee.name}(`);
  genNodeList(args, context);
  push(')');
}

function genStringLiteral (node, context) {
  const { push } = context;
  push(`'${node.value}'`);
}

function genArrayExpression (node, context) {
  const { push } = context;
  push('[');
  genNodeList(node.elements, context);
  push(']');
}

// 递归处理子节点数组，结果用 , 拼接
function genNodeList (nodes, context) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    genNode(node, context);
    if (i < nodes.length - 1) {
      push(', ');
    }
  }
}

// 通过 AST 生成代码
export default function generate (node) {
  const context = {
    code: '',
    push (code) {
      context.code += code;
    },
    // 当前缩进的级别，初始为 0 ，没有缩进
    currentIndent: 0,
    newLine () {
      context.code += '\n' + '  '.repeat(context.currentIndent);
    },
    // 用来缩进，即让 currentIndent 自增后，调用换行函数
    indent () {
      context.currentIndent++;
      context.newLine();
    },
    // 取消缩进，即让 currentIndent 自减后，调用换行函数
    deIndent () {
      context.currentIndent--;
      context.newLine();
    },
  };
  genNode(node, context);
  return context.code;
}
