const fs = require('fs');
//const {parse, SyntaxError} = require('./dream-parser');
const {parse} = require('./dream-parser');

const [,, inFilePath] = process.argv;
console.log('parsing', inFilePath, 'which contains');

fs.readFile(inFilePath, (err, buf) => {
  if (err) throw err;
  const text = buf.toString().trim();
  console.log(text, '\n');
  const result = parse(text);
  console.log('result =', result);
});
