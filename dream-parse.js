const fs = require('fs');
//const {parse, SyntaxError} = require('./dream-parser');
const {parse} = require('./dream-parser');

const [,, inPath, outPath] = process.argv;
console.log('creating', outPath);
console.log('parsing', inPath, 'which contains');

function toJs(node) {
  const {type, value} = node;
  switch (type) {
    case 'assignment':
      return `const ${node.name} = ${value}`;
    case 'comment':
      return '// ' + value;
    case 'write':
      return `console.log(${value});`;
    default:
      return '';
  }
}

fs.readFile(inPath, (err, buf) => {
  if (err) throw err;
  const text = buf.toString().trim();
  console.log(text, '\n');
  const [nodes] = parse(text);
  console.log('nodes =', nodes);

  const ws = fs.createWriteStream(outPath);
  for (const node of nodes) {
    const line = toJs(node);
    console.log(line);
    ws.write(line + '\n');
  }
  ws.end();
});
