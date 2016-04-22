# MARC record validation [![Build Status](https://travis-ci.org/NatLibFi/marc-record-validate.svg)](https://travis-ci.org/NatLibFi/marc-record-validate) [![Test Coverage](https://codeclimate.com/github/NatLibFi/marc-record-validate/badges/coverage.svg)](https://codeclimate.com/github/NatLibFi/marc-record-validate/coverage)

**IN DEVELOPMENT**

Validate and fix MARC records

## Usage

### Node.js

```js
var validate = require('marc-record-validate'){
  fix: true
});

validate(record);
```

### AMD
```js
define(['marc-record-validate'], function(validateFactory) {

  var validate = validateFactory({
    fix: true
  });

  validate(record);

});
```

## Specifying custom validators

Use **marc_record-validate/lib/validate** to speficy the validators:

```js
var fn_factory = require('marc-record-validate/lib/validate')([
  require('marc-record-validate/lib/validators/some-validator'),
  require('my-validators/lib/foobar')
]);

fn_factory({
  fix: true
})(record);
```

## Configuration

TODO

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
