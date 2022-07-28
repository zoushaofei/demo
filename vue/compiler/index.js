import parse from './parse.js';
import transforms from './transforms.js';
import generate from './generate.js';

/**
 * <div><p>Vue</p><p>Template</p></div>
 * 将模版字符串进行 token 标记
 * [
 *   {type: 'tag', name: 'div'},
 *   {type: 'tag', name: 'p'},
 *   {type: 'text', content: 'Vue'},
 *   {type: 'tagEnd', name: 'p'},
 *   {type: 'tag', name: 'p'},
 *   {type: 'text', content: 'Template'},
 *   {type: 'tagEnd', name: 'p'},
 *   {type: 'tagEnd', name: 'div'},
 * ]
 *
 * 转化为 Ast
 * const root = {
 *   type: "Root",
 *   children: [
 *     {
 *       type: "Element",
 *       tag: "div",
 *       children: [
 *         {
 *           type: "Element",
 *           tag: "p",
 *           children: [
 *             { type: "Text", content: "Vue" }
 *           ]
 *         },
 *         {
 *           type: "Element",
 *           tag: "p",
 *           children: [
 *             { type: "Text", content: "Template" }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * 然后再转化为 javaScript Ast
 * const FunctionDeclNode = {
 *   type: 'FunctionDecl',
 *   id: {
 *     type: 'Identifier',
 *     name: 'render'
 *   },
 *   params: [],
 *   body: [
 *     {
 *       type: 'ReturnStatement',
 *       return: {
 *         type: 'CallExpression',
 *         callee: { type: 'Identifier', name: 'h' },
 *         arguments: [
 *           { type: 'StringLiteral', value: 'div' },
 *           {
 *             type: 'ArrayExpression',
 *             elements: [
 *               {
 *                 type: 'CallExpression',
 *                 callee: { type: 'Identifier', name: 'h' },
 *                 arguments: [
 *                   { type: 'StringLiteral', value: 'p' },
 *                   { type: 'StringLiteral', value: 'Vue' },
 *                 ]
 *               },
 *               {
 *                 type: 'CallExpression',
 *                 callee: { type: 'Identifier', name: 'h' },
 *                 arguments: [
 *                   { type: 'StringLiteral', value: 'p' },
 *                   { type: 'StringLiteral', value: 'Template' },
 *                 ]
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     }
 *   ]
 * }
 *
 * 最终转换为 渲染函数
 * function render () {
 *   return h('div', [
 *      h('p', 'Vue'),
 *      h('p', 'Template')
 *   ])
 * }
 */

export function compiler (template = '') {
  // 模版 AST
  const ast = parse(template);
  // 将模版 AST 转换为 JavaScript AST
  transforms(ast);
  // 通过 AST 生成代码
  const code = generate(ast.jsNode);

  return code;
}