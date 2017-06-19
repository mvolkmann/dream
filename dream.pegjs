//TODO: Disallow multiple assignments to the same variable in the same scope.

start
  = ((assignment / blankLine / comment / write / call) newline?)*

/*
//----------------------------------------------------------------------------

logicalOperatorBinary
  = ws operator:('and' / 'or') ws {
    return operator;
  }

logicalOperatorUnary
  = ws operator:'not' ws {
    return operator;
  }

relationalOperator
  = ws operator:('<' / '<=' / '==' / '!=' / '>=' / '>') ws {
    return operator;
  }

//----------------------------------------------------------------------------

binaryComparison
  = leftExpr:expression operator:(logicalOperatorBinary / relationalOperator) rightExpr:expression {
      return {kind: operator, leftExpr, rightExpr};
    }

unaryComparison
  = operator:logicalOperatorUnary expression:expression {
      return {kind: operator, expression};
    }

// When "name", it must be a boolean variable.
booleanExpression
  = name / unaryComparison / binaryComparison
*/

//----------------------------------------------------------------------------

additive
  = left:multiplicative ws '+' ws right:additive {
      return {kind: 'add', left, right};
    }
  / multiplicative

multiplicative
  = left:primary ws '*' ws right:multiplicative {
      return {kind: 'multiply', left, right};
    }
  / primary

primary
  = integer
  / name
  / '(' ws additive:additive ws ')' {
    return additive;
  }

//----------------------------------------------------------------------------

argument
  = space+ ('\\' space* '\n' space*)? expr:expression {
    return expr;
  }

assignment
  // after =, can have a value or a function!
  = name:name ws '=' ws expression:expression {
    console.log('found assignment to', name);
    console.log('found assignment with expression =', expression);
    return {kind: 'assignment', name, expression};
  }

blankLine
  = newline {
    //console.log('found blank line');
    return {kind: 'blank line'};
  }

boolean
  = 'true' / 'false'

// A call with no arguments must be surrounded by parens.
// Each argument must be preceded by at least one space.
// Each argument can be preceded by a backslash and a newline
// to continue it on the next line.
call
  = name:name args:argument+ {
    //console.log('found call to', name);
    //console.log('found call with arguments', args);
    return {kind: 'call', name:name, args:args};
  }

comment
  = singleLineComment

// "name" must come after "write" so the
// "write" keyword isn't treated as a name!
// "call" must come after "name" so
// references to variables aren't treated like calls to functions.
expression
  //= function / nestedCall / ternary / value / write / additive
  = function / nestedCall / value / write / additive

function
  = parameters:(parameter ws)* '=>' ws expression:expression {
    //console.log('found function with params =', params);
    //console.log('found function with expression =', expression);
    const params = parameters.map(p => p[0]);
    return {kind: 'function', params, expression};
  }

digits
  = digits:[0-9]+ {
    return digits.join('');
  }

float
  = whole:integer '.' fraction:digits exponent:('e' integer)? {
    const exp = exponent ? exponent.join('') : '';
    const text = `${whole}.${fraction}${exp}`;
    return text;
  }

positiveInteger
  = first:[1-9] rest:[0-9]* {
    return first + rest.join('');
  }

integer
  = posInt:'0' / sign:'-'? posInt:positiveInteger {
    const text = `${sign ? sign : ''}${posInt}`;
    return parseInt(text, 10);
  }

name
  = first:[a-z] rest:[0-9a-zA-Z]* {
    //console.log('found name with first =', first);
    //console.log('found name with rest =', rest);
    const name = first + rest.join('');
    //console.log('found name', name);
    return name;
  }

nestedCall
  = '(' name:name args:(ws expression)* ')' {
    //console.log('found nested call to', name);
    args = args.map(arr => arr[1]);
    //console.log('found nested call with arguments', args);
    return {kind: 'call', name:name, args:args};
  }

newline = '\n' {
  //console.log('found newline');
}

parameter
  = name:name ':' type:type {
    //console.log('found parameter');
    return {kind: 'parameter', name, type};
  }

singleLineComment
  = '--' rest:[^\n]* {
    //console.log('found singleLineComment');
    const commentText = rest.join('');
    return {
      kind: 'comment',
      value: commentText
    };
  }

space
  = ' '

string
  = "'" chars:[^']* "'" {
    return {kind: 'string', value: chars.join('')};
  }

ternary
  = condition:expression ws '?' ws consequent:expression ws ':' ws alternate:expression {
    return {kind: 'ternary', condition, consequent, alternate};
  }

type
  = 'Bool' / 'Float' / 'Int' / 'String'

// "float" must come before "integer".
value
  = value:(boolean / float / integer / string) {
    //console.log('found value', value);
    return value;
  }

write
  = 'write' ws expression:expression {
    //console.log('found write with expression', expression);
    return {kind: 'write', expression};
  }

ws = [ \n]+
