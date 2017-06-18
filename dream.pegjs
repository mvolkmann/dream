start
  = ((assignment / blankLine / comment / expression) newline?)*

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

call
  = '(' name:name args:(ws expression)* ')' {
    console.log('found call to', name);
    args = args.map(arr => arr[1]);
    console.log('with arguments', args);
    return {kind: 'call', name:name, args:args};
  }

comment
  = singleLineComment

expression
  = call / function / value / write

function
  = params:(parameter ws)* '=>' ws expression:expression {
    console.log('found function with params =', params);
    console.log('found function with expression =', expression);
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
    const name = first + rest.join('');
    //console.log('found name', name);
    return name;
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
    return chars.join('');
  }

type
  = 'Bool' / 'Float' / 'Int' / 'String'

value
  = boolean / integer / string

write
  = 'write' ws expression:expression {
    console.log('found write with expression', expression);
    return {kind: 'write', expression};
  }

ws = [ \n]+
