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

'use strict';

/* eslint-disable require-await */

import {MarcRecord} from '@natlibfi/marc-record';

export default function (validators = []) {
	if (validators.length === 0) {
		throw new Error('No validators provided');
	} else {
		return async function (originalRecord, options = {}) {
			const {fix = false, failOnError = false, validateFixes = false} = options;
			const record = MarcRecord.clone(originalRecord);

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

				if (typeof (messages) !== 'undefined') {
					response.messages = messages;
				}

				return response;
			}

			async function iterate(pendingValidators, results = []) {
				const validator = pendingValidators.shift();

				if (validator) {
					const {valid, messages} = await validator.validate(record);
					const response = getResponse(validator, messages);

					if (valid) {
						response.state = 'valid';
						return iterate(pendingValidators, results.concat(response));
					}

					if (fix && validator.fix) {
						await validator.fix(record);
						response.state = 'fixed';
						return iterate(pendingValidators, results.concat(response));
					}

					if (failOnError) {
						return results.concat(response);
					}

					return iterate(pendingValidators, results.concat(response));
				}
				return results;
			}

			async function iterateValidate(pendingValidators, pendingResults, results = []) {
				const validator = pendingValidators.shift();
				const originalResult = pendingResults.shift();

				if (validator) {
					const {valid, messages} = await validator.validate(record);
					const response = getResponse(validator, messages);

					if (valid) {
						response.state = originalResult.state === 'fixed' ? 'fixed' : 'valid';
						return iterateValidate(pendingValidators, pendingResults, results.concat(response));
					}

					if (failOnError) {
						return results.concat(response);
					}

					return iterateValidate(pendingValidators, pendingResults, results.concat(response));
				}
				return results;
			}
		};
	}
}
