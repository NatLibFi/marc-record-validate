import {describe, it} from 'node:test';
import assert from 'node:assert';
import sinon from 'sinon';
import {MarcRecord} from '@natlibfi/marc-record';
import validateFactory from './index.js';

describe('index', () => {
  it('Should throw and error because of undefined validators', () => {
    try {
      validateFactory();
    } catch (error) {
      assert.match(error.message, new RegExp('^No validators provided$', 'u'));
    }
  });

  it('Should validate and fix a record', async () => {
    const validator = {
      description: 'foo',
      validate: () => ({valid: false}),
      fix: record => record.appendField({tag: 'BAR', value: 'bar'})
    };
    const validate = validateFactory([validator]);
    const record = new MarcRecord({fields: [{tag: 'FOO', value: 'foo'}]});
    const result = await validate(record, {fix: true});

    assert.equal(typeof result, 'object');
    assert.equal(Object.hasOwn(result, 'record'), true);
    assert.equal(Object.hasOwn(result, 'valid'), true);

    assert.equal(Object.hasOwn(result, 'report'), true);
    assert.deepStrictEqual(result.report, [{description: 'foo', state: 'fixed'}]);

    assert.deepStrictEqual(result.record.toObject(), {
      leader: '',
      fields: [
        {tag: 'FOO', value: 'foo'},
        {tag: 'BAR', value: 'bar'}
      ]
    });
  });

  it('Should return after the first validator', async () => {
    const validator1 = {
      description: 'foo',
      validate: () => ({valid: false})
    };
    const validator2 = {
      description: 'bar',
      validate: sinon.spy(() => ({valid: true}))
    };
    const validate = validateFactory([validator1, validator2]);
    const record = new MarcRecord({fields: [{tag: 'FOO', value: 'bar'}]});
    const result = await validate(record, {failOnError: true});

    assert.equal(validator2.validate.called, false);

    assert.equal(typeof result, 'object');
    assert.equal(Object.hasOwn(result, 'record'), true);
    assert.equal(Object.hasOwn(result, 'valid'), true);

    assert.equal(Object.hasOwn(result, 'report'), true);
    assert.deepStrictEqual(result.report, [{description: 'foo', state: 'invalid'}]);

    assert.equal(MarcRecord.isEqual(record, result.record), true);
  });

  it('Should validate the fixes', async () => {
    const validator1 = {
      description: 'foo',
      fix: record => record.appendField({tag: 'BAR', value: 'bar'}),
      validate: () => ({valid: false})
    };
    const validator2 = {
      description: 'bar',
      fix: () => ({state: 'fixed'}),
      validate: sinon.stub()
        .onFirstCall().returns(Promise.resolve({valid: false}))
        .onSecondCall().returns(Promise.resolve({valid: true}))
    };

    const validate = validateFactory([validator1, validator2]);
    const record = new MarcRecord({fields: [{tag: 'FOO', value: 'foo'}]});
    const result = await validate(record, {fix: true, validateFixes: true});

    assert.equal(typeof result, 'object');
    assert.equal(Object.hasOwn(result, 'record'), true);
    assert.equal(Object.hasOwn(result, 'valid'), true);

    assert.equal(Object.hasOwn(result, 'report'), true);
    assert.deepStrictEqual(result.report, [
      {description: 'foo', state: 'invalid'},
      {description: 'bar', state: 'fixed'}
    ]);

    assert.deepStrictEqual(result.record.toObject(), {
      leader: '',
      fields: [
        {tag: 'FOO', value: 'foo'},
        {tag: 'BAR', value: 'bar'}
      ]
    });
  });
});
