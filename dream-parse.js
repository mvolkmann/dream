const fs = require('fs');
//const {parse, SyntaxError} = require('./dream-parser');
const {parse} = require('./dream-parser');

function toJs(node, top) {
  //console.log('dream-parse.js toJs: node =', node);
  const type = typeof node;
  if (type !== 'object') {
    console.log('dream-parse.js toJs: non-object node', node);
    return node;
  }

  const {args, expression, kind, name, params, value} = node;

  switch (kind) {
    case 'assignment':
      return `const ${name} = ${toJs(expression)};`;

    case 'blank line':
      return '';

    case 'call': {
      const argValues = args.map(toJs);
      const semi = top ? ';' : '';
      return `${name}(${argValues.join(', ')})${semi}`;
    }

    case 'comment':
      return '//' + value;

    case 'function': {
      const paramNames = params.map(p => p.name);
      const beforeArrow = paramNames.length === 1 ?
        paramNames[0] : `(${paramNames.join(', ')})`;
      const afterArrow = toJs(expression);
      return `${beforeArrow} => ${afterArrow}`;
    }

    case 'string': {
      return `'${value}'`;
    }

    case 'write': {
      const semi = top ? ';' : '';
      return `console.log(${toJs(expression)})${semi}`;
    }

    default:
      return undefined;
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
      console.log('node =', JSON.stringify(node));
      const line = toJs(node[0], true);
      //console.log(line);
      ws.write(line + '\n');
    }
    ws.end();
  } catch (e) {
    //console.error('e =', e);
    const {expected, found, location} = e;
    if (location) {
      const {start} = location;
      const {column, line} = start;
      console.error('syntax error on line', line, 'at column', column);
      console.error('found', found);
      console.error('expected one of', expected);
    } else {
      console.error('error', e);
    }
  }
});
