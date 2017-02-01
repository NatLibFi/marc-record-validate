# MARC record validation [![NPM Version](https://img.shields.io/npm/v/marc-record-validate.svg)](https://npmjs.org/package/marc-record-validate) [![Build Status](https://travis-ci.org/NatLibFi/marc-record-validate.svg)](https://travis-ci.org/NatLibFi/marc-record-validate) [![Test Coverage](https://codeclimate.com/github/NatLibFi/marc-record-validate/badges/coverage.svg)](https://codeclimate.com/github/NatLibFi/marc-record-validate/coverage)

This project contains the software to run MARC validators. For the actual validators, see [marc-record-validators-melinda](https://github.com/natlibfi/marc-record-validators-melinda).

See the [wiki](https://github.com/NatLibFi/marc-record-validate/wiki/Writing-validators) on how to write validators.

## Usage

When the validate function is called on a MARC record (Implemented by [marc-record-js](https://github.com/petuomin/marc-record-js)) each enabled validator is ran to provide information about the record's validity. The validators can also fix warnings returned by the validator, if enabled.

The function resolves (Using a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)) with an object which contains the validator messages and fix modifications:

```js
{
  "failed": false,
  "validators": [{
    "name": "foo",
    "validate": [{
      "tag": "245",
      "messages": [{
        "type": "warning",
        "messages": "Has 'fu' instead of 'foo'"
      }]  
    }],
    "fix": [{
      "tag": "245",
      "modifications": [{
        "type": "modifyField",
        "old": {
          "tag": "245",
          "subfields": [{
            "code": "a",
            "value": "All is fubar"
          }]
        },
        "new": {
          "tag": "245",
          "subfields": [{
            "code": "a",
            "value": "All is foobar"
          }]
        }
      }]
    }]
  }]
}
```

### Node.js

```js
validate = require('marc-record-validate')([
  require('foobar/lib/validators/foo'),
  require('foobar/lib/validators/bar'),
])(config),

return validate(record).then(function(results) {
  // Do something with results
});

```

### AMD
```js
define(['marc-record-validate'], function(validationFactory, validator_foo, validator_bar) {

  var validate = validationFactory([
    validator_foo,
    validator_bar
  ])(config);

  return validate(record).then(function(results) {
    // Do something with results
  });

});
```

## Configuration

The configuration is passed as an object to the function returned by the factory. The following properties are supported:

- **validators** *(array)*: An array of validator names or validator specification objects. The specified validators will be enabled. Defaults to empty (All validators enabled)
- **failOnError** *(boolean)*: Throw an error immediately if a validator returns an error message. Defaults to true.
- **fix** *(boolean)*: Whether to fix records which had any warnings (Returned by the validator). Defaults to false.

## Development 

Clone the sources and install the package using `npm`:

```sh
npm install
```

Run the following NPM script to lint, test and check coverage of the code:

```javascript

npm run check

```

## License and copyright

Copyright (c) 2014-2016 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **GNU Affero General Public License Version 3** or any later version.
