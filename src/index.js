/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Validate and fix MARC records
*
* Copyright (C) 2014-2018 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-record-validate
*
* marc-record-validate program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* marc-record-validate is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
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

			async function iterate(pendingValidators, results = []) {
				const validator = pendingValidators.shift();

				if (validator) {
					const {valid, messages} = await validator.validate(record);

					if (valid) {
						return iterate(pendingValidators, results.concat({
							description: validator.description,
							state: 'valid'
						}));
					}

					if (fix && validator.fix) {
						await validator.fix(record);
						return iterate(pendingValidators, results.concat({
							description: validator.description,
							state: 'fixed',
							messages
						}));
					}

					if (failOnError) {
						return results.concat({
							description: validator.description,
							state: 'invalid',
							messages
						});
					}

					return iterate(pendingValidators, results.concat({
						description: validator.description,
						state: 'invalid',
						messages
					}));
				}
				return results;
			}

			async function iterateValidate(pendingValidators, pendingResults, results = []) {
				const validator = pendingValidators.shift();
				const originalResult = pendingResults.shift();

				if (validator) {
					const {valid, messages} = await validator.validate(record);

					if (valid) {
						return iterateValidate(pendingValidators, pendingResults, results.concat({
							description: validator.description,
							state: originalResult.state === 'fixed' ? 'fixed' : 'valid',
							messages
						}));
					}

					if (failOnError) {
						return results.concat({
							description: validator.description,
							state: 'invalid',
							messages
						});
					}

					return iterateValidate(pendingValidators, pendingResults, results.concat({
						description: validator.description,
						state: 'invalid',
						messages
					}));
				}
				return results;
			}
		};
	}
}
