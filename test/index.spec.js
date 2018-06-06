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

/* eslint-disable no-unused-expressions */

'use strict';

import {expect} from 'chai';
import sinon from 'sinon';
import MarcRecord from 'marc-record-js';
import validateFactory from '../src';

describe('index', () => {
	it('Should throw and error because of undefined validators', () => {
		expect(validateFactory).to.throw(Error, /^No validators provided$/);
	});

	it('Should validate and fix a record', async () => {
		const validator = {
			description: 'foo',
			validate: async () => ({valid: false}),
			fix: async record => record.appendField({tag: 'BAR', value: 'bar'})
		};
		const validate = validateFactory([validator]);
		const record = new MarcRecord({fields: [{tag: 'FOO', value: 'foo'}]});
		const result = await validate(record, {fix: true});

		expect(result).to.have.property('record');
		expect(result).to.have.property('valid', true);
		expect(result).to.have.deep.property('report', [
			{description: 'foo', state: 'fixed', messages: undefined}
		]);

		expect(MarcRecord.isEqual(result.record, {
			fields: [
				{tag: 'FOO', value: 'foo'},
				{tag: 'BAR', value: 'bar'}
			]
		})).to.be.true;
	});

	it('Should return after the first validator', async () => {
		const validator1 = {
			description: 'foo',
			validate: async () => ({valid: false})
		};
		const validator2 = {
			description: 'bar',
			validate: sinon.spy(async () => ({valid: true}))
		};
		const validate = validateFactory([validator1, validator2]);
		const record = new MarcRecord({fields: [{tag: 'FOO', value: 'bar'}]});
		const result = await validate(record, {failOnError: true});

		expect(validator2.validate.called).to.be.false;

		expect(result).to.have.property('record');
		expect(result).to.have.property('valid', false);
		expect(result).to.have.deep.property('report', [
			{description: 'foo', state: 'invalid', messages: undefined}
		]);

		expect(MarcRecord.isEqual(record, result.record)).to.be.true;
	});

	it('Should validate the fixes', async () => {
		const validator1 = {
			description: 'foo',
			fix: async record => record.appendField({tag: 'BAR', value: 'bar'}),
			validate: async () => ({valid: false})
		};
		const validator2 = {
			description: 'bar',
			fix: async () => ({state: 'fixed'}),
			validate: sinon.stub()
				.onFirstCall().returns(Promise.resolve({valid: false}))
				.onSecondCall().returns(Promise.resolve({valid: true}))
		};

		const validate = validateFactory([validator1, validator2]);
		const record = new MarcRecord({fields: [{tag: 'FOO', value: 'foo'}]});
		const result = await validate(record, {fix: true, validateFixes: true});

		expect(result).to.have.property('record');
		expect(result).to.have.property('valid', false);
		expect(result).to.have.deep.property('report', [
			{description: 'foo', state: 'invalid', messages: undefined},
			{description: 'bar', state: 'fixed', messages: undefined}
		]);

		expect(MarcRecord.isEqual(result.record, {
			fields: [
				{tag: 'FOO', value: 'foo'},
				{tag: 'BAR', value: 'bar'}
			]
		})).to.be.true;
	});
});
