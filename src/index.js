import {MarcRecord} from '@natlibfi/marc-record';

export default function (validators = []) {
  if (validators.length === 0) {
    throw new Error('No validators provided');
  }

  return async function (originalRecord, options = {}, validationOptions = {}) {
    const {fix = false, failOnError = false, validateFixes = false} = options;
    const record = MarcRecord.clone(originalRecord, validationOptions);

    let results = await iterate(validators.slice());

    if (validateFixes && results.some(r => r.state === 'fixed')) {
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
        response.messages = messages;
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
          response.state = 'valid';
          return iterate(restPendingValidators, results.concat(response));
        }

        if (fix && validator.fix) {
          await validator.fix(record);
          response.state = 'fixed';
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
          response.state = originalResult.state === 'fixed' ? 'fixed' : 'valid';
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
