# Validate and fix MARC records [![NPM Version](https://img.shields.io/npm/v/@natlibfi/marc-record-validate.svg)](https://npmjs.org/package/@natlibfi/marc-record-validate) [![Build Status](https://travis-ci.org/NatLibFi/marc-record-validate.svg)](https://travis-ci.org/NatLibFi/marc-record-validate) [![Test Coverage](https://codeclimate.com/github/NatLibFi/marc-record-validate/badges/coverage.svg)](https://codeclimate.com/github/NatLibFi/marc-record-validate/coverage)

Javascript module to validate and fix MARC records.

## Usage
```js
import {DoubleCommas} from '@natlibfi/marc-record-validators-melinda';
import validateFactory from '@natlibfi/marc-record-validate';

async function run() {
  const validate = validateFactory([await DoubleCommas()]);
  const result = await validate(marcRecord);
}
```
## Configuration
The module returns a factory function that takes an array of validators as an argument. The factory creates a validate function that takes a [MARC record](https://www.npmjs.com/package/@natlibfi/marc-record) instance and optional options as an object:
- **fix**: Whether to run fix-method of the validator or not. Defaults to *false*
- **failOnError**: Do not running remaining validators if the record does not validate (And cannot be fixed if **fix** is set to *true*). Defaults to *false*
- **validateFixes**: Re-run validators after all validators have been processed. Only the validate-method will be called so that fixes are not applied twice. Defaults to *false*
## Validators
See [marc-record-validators-melinda](https://github.com/NatLibFi/marc-record-validators-melinda/wiki) for reference on how to write validators.
## License and copyright

Copyright (c) 2014-2019, 2022 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **MIT** or any later version.
