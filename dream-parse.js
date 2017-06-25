// @flow

const fs = require('fs');
//const {parse, SyntaxError} = require('./dream-parser');
const {parse} = require('./dream-parser');

type AssignmentType = {
  kind: 'assignment',
  name: string,
  expression: NodeType
};

type BinaryMathType = {
  kind: 'binaryMath',
  operator: string,
  left: NodeType,
  right: NodeType
};

type BooleanType = {
  kind: 'boolean',
  value: boolean
};

type CallType = {
  kind: 'boolean',
  name: string,
  args: NodeType[]
};

type CommentType = {
  kind: 'comment',
  text: string
};

type ConditionType = BooleanType | RelationalType | CallType;

type ExpressionType = CallType | PrimitiveType | TernaryType;

type FunctionType = {
  kind: 'function',
  params?: ParameterType[],
  returnType: string,
  expression: NodeType
};

type NumberType = {
  kind: 'number',
  value: number
};

type OrderedType = NumberType | StringType;

type ParameterType = {
  kind: 'parameter',
  name: string,
  type: string
};

type PrimitiveType = BooleanType | NumberType | StringType;

type RelationalType = {
  kind: 'relational',
  operator: string,
  left: OrderedType,
  right: OrderedType
};

type StringType = {
  kind: 'string',
  value: string
};

type TernaryType = {
  kind: 'ternary',
  condition: ConditionType,
  consequent: ExpressionType,
  alternate: ExpressionType
};

type WriteType = {
  kind: 'write',
  expression: ExpressionType
};

type NodeType =
  AssignmentType | BinaryMathType | CallType | CommentType | ConditionType |
  FunctionType | PrimitiveType | TernaryType | WriteType;

function isPrimitive(value: mixed): boolean {
  const t = typeof value;
  return t === 'boolean' || t === 'number' || t === 'string';
}

function toJs(node: NodeType, top?: boolean = false): string {
  /*
  if (!node) {
    console.error('no node passed to toJs');
    return;
  }
  */

  //console.log('dream-parse.js toJs: node =', node);
  if (isPrimitive(node)) return String(node);

  switch (node.kind) {
    case 'assignment':
      return `const ${node.name} = ${toJs(node.expression)};`;

    case 'binaryMath':
      return `${toJs(node.left)} ${node.operator} ${toJs(node.right)}`;

    case 'blank line':
      return '';

    case 'call': {
      const argValues = node.args.map(toJs);
      const semi = top ? ';' : '';
      return `${node.name}(${argValues.join(', ')})${semi}`;
    }

    case 'comment':
      return '//' + node.text;

    case 'function': {
      const {expression, params} = node;
      const paramNames = params ? params.map(p => p.name) : [];
      const beforeArrow = paramNames.length === 1 ?
        paramNames[0] : `(${paramNames.join(', ')})`;
      const afterArrow = toJs(expression);
      return `${beforeArrow} => ${afterArrow}`;
    }

    case 'string': {
      const {value} = node;
      // Determine whether the string contains any "{"
      // that are not immediately preceded by "\"
      // and are followed by a "}".
      const interpolate = /[^\\]{.+}/.test(value);
      return interpolate ?
        `\`${value.replace(/([^\\]){/g, '$1${')}\`` :
        `'${value}'`;
    }

    case 'ternary': {
      const {condition, consequent, alternate} = node;
      return `${toJs(condition)} ? ${toJs(consequent)} : ${toJs(alternate)}`;
    }

    case 'write': {
      const semi = top ? ';' : '';
      return `console.log(${toJs(node.expression)})${semi}`;
    }

    default:
      throw new Error(`unexpected node kind "${node.kind}"`);
  }
}

const [,, inPath, outPath] = process.argv;
console.log('creating', outPath);
//console.log('parsing', inPath, 'which contains');
console.log('parsing', inPath);

fs.readFile(inPath, (err, buf) => {
  if (err) throw err;
  const text = buf.toString().trim();
  //console.log(text, '\n');
  const lines = text.split('\n');

  try {
    const nodes = parse(text);

    const ws = fs.createWriteStream(outPath);
    for (const node of nodes) {
      //console.log('node =', JSON.stringify(node));
      const line = toJs(node[0], true);
      //console.log(line);
      ws.write(`${String(line)}\n`);
    }
    ws.end();
  } catch (e) {
    //console.error('e =', e);
    const {location, message} = e;

    if (location) {
      const {start} = location;
      const {column, line} = start;
      console.error('syntax error on line', line, 'at column', column);
      console.error(`line: ${lines[line - 1]}`);
    } else {
      console.error('error', e);
    }

    console.error(message);
    //console.error('found', found);
    //console.error('expected one of', expected);
  }
});
