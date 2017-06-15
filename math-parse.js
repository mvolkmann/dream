const fs = require('fs');
const {parse, SyntaxError} = require('./math-parser');

const [,, inFilePath] = process.argv;
console.log('parsing', inFilePath);

fs.readFile(inFilePath, (err, buf) => {
  if (err) throw err;
  const text = buf.toString().trim();
  console.log('text =', text);
  const result = parse(text);
  console.log('result =', result);
});
