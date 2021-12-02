/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Validate and fix MARC records
*
* Copyright (c) 2014-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-record-validate
*
* marc-record-validate program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* marc-record-validate is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import {MarcRecord} from '@natlibfi/marc-record';

export default function (validators = []) {
  if (validators.length === 0) { // eslint-disable-line functional/no-conditional-statement
    throw new Error('No validators provided');
  }

  return async function (originalRecord, options = {}, validationOptions = {}) {
    const {fix = false, failOnError = false, validateFixes = false} = options;
    const record = MarcRecord.clone(originalRecord, validationOptions);

    let results = await iterate(validators.slice()); // eslint-disable-line functional/no-let

    if (validateFixes && results.some(r => r.state === 'fixed')) { // eslint-disable-line functional/no-conditional-statement
      results = await iterateValidate(validators.slice(), results.slice());
    }

    return {
      record,
      report: results,
      valid: results.every(r => r.state !== 'invalid')
    };

    function getResponse(validator, messages) {
      const response = {
        description: validator.description,
        state: 'invalid'
      };

      if (typeof messages !== 'undefined') {
        response.messages = messages; // eslint-disable-line functional/immutable-data
        return response;
      }

      return response;
    }

    async function iterate(pendingValidators, results = []) {
      const [validator, ...restPendingValidators] = pendingValidators;

      if (validator) {
        const {valid, messages} = await validator.validate(record);
        const response = getResponse(validator, messages);

        if (valid) {
          response.state = 'valid'; // eslint-disable-line functional/immutable-data
          return iterate(restPendingValidators, results.concat(response));
        }

        if (fix && validator.fix) {
          await validator.fix(record);
          response.state = 'fixed'; // eslint-disable-line functional/immutable-data
          return iterate(restPendingValidators, results.concat(response));
        }

        if (failOnError) {
          return results.concat(response);
        }

        return iterate(restPendingValidators, results.concat(response));
      }
      return results;
    }

    async function iterateValidate(pendingValidators, pendingResults, results = []) {
      const [validator, ...restPendingValidators] = pendingValidators;
      const [originalResult, ...restPendingResults] = pendingResults;

      if (validator) {
        const {valid, messages} = await validator.validate(record);
        const response = getResponse(validator, messages);

        if (valid) {
          response.state = originalResult.state === 'fixed' ? 'fixed' : 'valid'; // eslint-disable-line functional/immutable-data
          return iterateValidate(restPendingValidators, restPendingResults, results.concat(response));
        }

        if (failOnError) {
          return results.concat(response);
        }

        return iterateValidate(restPendingValidators, restPendingResults, results.concat(response));
      }
      return results;
    }
  };
}
