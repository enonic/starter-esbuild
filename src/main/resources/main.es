import '/lib/nashorn/ponyfills';
import '/lib/nashorn/polyfills';

import getIn from 'get-value';
import setIn from 'set-value';

const text = 'code'; // error: Transforming const to the configured target environment is not supported yet
log.info(`Hi from transpiled ${text} :)`); // error: Transforming template literals to the configured target environment is not supported yet

var obj = {
  a: 'a',
  b: 'b'
};
log.info(`obj:${JSON.stringify(obj)}`);

// Rest properties
var {...rest} = obj; // error: Transforming destructuring to the configured target environment is not supported yet
log.info(`rest:${JSON.stringify(rest)}`);

setIn(obj, 'nested.twice', 'value');
log.info(`nested.twice:${JSON.stringify(
  getIn(obj, 'nested.twice')
)}`);

// Array find
const array1 = [5, 12, 8, 130, 44];
log.info(`array.find:${JSON.stringify(
  array1.find(element => element > 10)
)}`);

// Spread properties
var copy = {...obj};
log.info(`copy:${JSON.stringify(copy)}`);
