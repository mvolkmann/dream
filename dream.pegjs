start
  = (comment / expression / write)* newline?

assignment
  = name:variableName ws '=' ws value:value newline? {
  //console.log('assignment: name = name');
  //console.log('assignment: value = value');
  return {type: 'assignment', name, value};
}

//call = ...

comment
  = singleLineComment

//expression = assignment / call
expression
  = assignment

integer
  = first:[1-9] rest:[0-9]+ {
  const text = first + rest.join('');
  return parseInt(text, 10);
}

newline = '\n'

singleLineComment
  = '--' rest:[^\n]* newline? {
  const commentText = rest.join('');
  //console.log('singleLineComment: commentText =', commentText);
  return {
    type: 'comment',
    value: commentText
  };
}

value
  = integer

variableName
  = first:[a-z] rest:[a-z0–9]i* {
    const name = first + rest.join('');
    //console.log('variableName: name =', name);
    return name;
  }

write
  = 'write' ws value:variableName newline? {
    return {type: 'write', value};
  }

ws = [ \n]+
