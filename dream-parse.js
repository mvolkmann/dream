const fs = require('fs');
//const {parse, SyntaxError} = require('./dream-parser');
const {parse} = require('./dream-parser');

function evalExpr(expression) {
  console.log('dream-parse.js evalExpr: expression =', expression);
  const type = typeof expression;
  if (type === 'string') return `'${expression}'`;
  if (type !== 'object') return expression;

  const {args, kind, name, params} = expression;

  switch (kind) {
    case 'call':
      return `${name}(${args.join(', ')});`;

    case 'function': {
      const paramNames = params.map(p => p[0].name);
      const beforeArrow = paramNames.length === 1 ?
        paramNames[0] : `(${paramNames.join(', ')})`;
      const afterArrow = evalExpr(expression.expression);
      return `${beforeArrow} => ${afterArrow}`;
    }

    case 'write':
      return `console.log(${evalExpr(expression.expression)});`;

    default:
      return undefined;
  }
}

function toJs(node) {
  if (!node) return;
  console.log('dream-parse.js toJs: node =', node);
  const {args, expression, kind, name, value} = node;

  switch (kind) {
    case 'assignment':
      return `const ${name} = ${evalExpr(expression)}`;
    case 'blank line':
      return '';
    case 'call': {
      console.log('dream-parse.js toJs: args =', args);
      const argValues = args.map(evalExpr);
      return `${name}(${argValues.join(', ')});`;
    }
    case 'comment':
      return '//' + value;
    case 'function':
      return `() => ${expression}`;
    case 'write':
      return `console.log(${evalExpr(expression)});`;
  }
}

const [,, inPath, outPath] = process.argv;
console.log('creating', outPath);
console.log('parsing', inPath, 'which contains');

fs.readFile(inPath, (err, buf) => {
  if (err) throw err;
  const text = buf.toString().trim();
  //console.log(text, '\n');

  try {
    const nodes = parse(text);

    const ws = fs.createWriteStream(outPath);
    for (const node of nodes) {
      const line = toJs(node[0]);
      console.log(line);
      ws.write(line + '\n');
    }
    ws.end();
  } catch (e) {
    //console.error('e =', e);
    const {expected, found, location} = e;
    const {start} = location;
    const {column, line} = start;
    console.error('syntax error on line', line, 'at column', column);
    console.error('found', found);
    console.error('expected one of', expected);
  }
});
