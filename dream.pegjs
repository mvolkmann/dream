start
  = ((assignment / blankLine / comment / write / call) newline?)*

assignment
  // after =, can have a value or a function!
  = name:name ws '=' ws expression:expression {
    //console.log('found assignment to', name);
    //console.log('found assignment with expression =', expression);
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
call
  = name:name args:(ws expression)+ {
    //console.log('found call to', name);
    args = args.map(arr => arr[1]);
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
  = function / nestedCall / value / write / name

function
  = params:(parameter ws)* '=>' ws expression:expression {
    //console.log('found function with params =', params);
    //console.log('found function with expression =', expression);
    return {kind: 'function', params, expression};
  }

integer
  = first:[1-9] rest:[0-9]* {
    //console.log('found integer');
    const text = first + rest.join('');
    return parseInt(text, 10);
  }

name
  = first:[a-z] rest:[a-z0–9]i* {
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

string
  = "'" chars:[^']* "'" {
    return {kind: 'string', value: chars.join('')};
  }

type
  = 'Bool' / 'Float' / 'Int' / 'String'

value
  = value:(boolean / integer / string) {
    //console.log('found value', value);
    return value;
  }

write
  = 'write' ws expression:expression {
    //console.log('found write with expression', expression);
    return {kind: 'write', expression};
  }

ws = [ \n]+
