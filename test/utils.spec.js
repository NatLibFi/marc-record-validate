/**
 *
 * @licstart  The following is the entire license notice for the JavaScript code in this file. 
 *
 * Validate and fix MARC records
 *
 * Copyright (c) 2014-2016 University Of Helsinki (The National Library Of Finland)
 *
 * This file is part of marc-record-validate
 *
 * marc-record-validate is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful,
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
 **/

/* istanbul ignore next: umd wrapper */
(function (root, factory) {

  'use strict';

  if (typeof define === 'function' && define.amd) {
    define([
      'chai/chai',
      'simple-mock',
      'marc-record-js',
      '../lib/utils'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('chai'),     
      require('simple-mock'),
      require('marc-record-js'),
      require('../lib/utils')
    );
  }

}(this, factory));

function factory(chai, simple, MarcRecord, utils)
{

  'use strict';

  var expect = chai.expect;

  describe('utils', function() {

    it('Should be the expected object', function() {
      expect(utils).to.be.an('object');
      expect(utils.validate).to.be.an('object');
      expect(utils.fix).to.be.an('object');
    });

    describe('validate', function() {

      it('Should be the expected object', function() {
        expect(utils.validate).to
          .respondTo('debug').and.to
          .respondTo('info').and.to
          .respondTo('warning').and.to
          .respondTo('error');
      });
      
      describe('#debug', function() {

        it('Should return the expected object', function() {
          expect(utils.validate.debug('foobar')).to.eql({
            type: 'debug',
            message: 'foobar'
          });
        });

        it('Should return the expected object with a field', function() {
          expect(utils.validate.debug('foobar', {})).to.eql({
            type: 'debug',
            message: 'foobar',
            field: {}
          });
        });

      });

      describe('#info', function() {

        it('Should return the expected object', function() {
          expect(utils.validate.info('foobar')).to.eql({
            type: 'info',
            message: 'foobar'
          });
        });

        it('Should return the expected object with a field', function() {
          expect(utils.validate.info('foobar', {})).to.eql({
            type: 'info',
            message: 'foobar',
            field: {}
          });
        });

      });

      describe('#warning', function() {

        it('Should return the expected object', function() {
          expect(utils.validate.warning('foobar')).to.eql({
            type: 'warning',
            message: 'foobar'
          });
        });

        it('Should return the expected object with a field', function() {
          expect(utils.validate.warning('foobar', {})).to.eql({
            type: 'warning',
            message: 'foobar',
            field: {}
          });
        });

      });

      describe('#error', function() {

        it('Should return the expected object', function() {
          expect(utils.validate.error('foobar')).to.eql({
            type: 'error',
            message: 'foobar'
          });
        });

        it('Should return the expected object with a field', function() {
          expect(utils.validate.error('foobar', {})).to.eql({
            type: 'error',
            message: 'foobar',
            field: {}
          });
        });

      });

    });
    
    describe('fix', function() {
      
      it('Should be the expected object', function() {
        expect(utils.fix).to
          .respondTo('modifyLeader').and.to
          .respondTo('addField').and.to
          .respondTo('removeField').and.to
          .respondTo('modifyFieldTag').and.to
          .respondTo('modifyFieldValue').and.to
          .respondTo('addSubfield').and.to
          .respondTo('removeSubfield').and.to
          .respondTo('addSubfield').and.to
          .respondTo('removeSubfield').and.to
          .respondTo('modifySubfieldCode').and.to
          .respondTo('modifySubfieldValue').and.to
          .respondTo('modifySubfields');
      });
      
      describe('#modifyLeader', function() {

        var record = new MarcRecord();
        
        expect(utils.fix.modifyLeader(record, 'foobar')).to.eql({
          type: 'modifyLeader',
          oldValue: '',
          newValue: 'foobar'
        });

        expect(record.leader).to.eql('foobar');

      });
      
    });
    
    describe('#addField', function() {

      it('Should add the field and return the expected object', function() {

        var record = new MarcRecord();
        
        expect(utils.fix.addField(record, {
          tag: 'foobar'
        })).to.eql({
          type: 'addField',
          field: {
            tag: 'foobar'
          }
        });

        expect(record.fields).to.eql([{
          tag: 'foobar',
        }]);

      });

    });

    describe('#removeField', function() {

      it('Should remove the field and return the expected object', function() {

        var field = {
          tag: 'foobar'
        },
        record = new MarcRecord({
          fields: [field]
        });
        
        expect(utils.fix.removeField(record, field)).to.eql({
          type: 'removeField',
          field: {
            tag: 'foobar'
          }
        });

        expect(record.fields.length).to.equal(0);
        
      });

    });

    describe('#moveField', function() {

      it('Should move a field to a lower index', function() {

        var record_original,
        field = {
          tag: '500',
          subfields: [{
            a: 'fubar'
          }]
        },
        record = new MarcRecord({
          fields: [
            {
              tag: '500',
              subfields: [{
                code: 'a',
                value: 'foo'
              }]
            },
            {
              tag: '500',
              subfields: [{
                code: 'a',
                value: 'bar'
              }]
            }
          ]
        });

        record.fields.push(field);
        record_original = record.toJsonObject();

        expect(utils.fix.moveField(record, field, 0)).to.eql({
          'type': 'moveField',
          'field': field,
          'old': 2,
          'new': 0
        });

        expect(record.toJsonObject()).to.not.eql(record_original);
        expect(record.fields.length).to.equal(record_original.fields.length);
        expect(record.fields.indexOf(field)).to.equal(0);
        
      });

      it('Should move a field to a higher index', function() {

        var record_original,
        field = {
          tag: '500',
          subfields: [{
            a: 'fubar'
          }]
        },
        record = new MarcRecord({
          fields: [
            {
              tag: '500',
              subfields: [{
                code: 'a',
                value: 'foo'
              }]
            },
            {
              tag: '500',
              subfields: [{
                code: 'a',
                value: 'bar'
              }]
            }
          ]
        });

        record.fields = [record.fields[0], field, record.fields[1]];
        record_original = record.toJsonObject();

        expect(utils.fix.moveField(record, field, 3)).to.eql({
          'type': 'moveField',
          'field': field,
          'old': 1,
          'new': 3
        });

        expect(record.toJsonObject()).to.not.eql(record_original);
        expect(record.fields.length).to.equal(record_original.fields.length);
        expect(record.fields.indexOf(field)).to.equal(2);

      });

    });
    
    describe('#modifyFieldTag', function() {

      it("Should modify the field's tag and return the expected object", function() {

        var field = {
          tag: 'foo'
        },
        field_original = JSON.parse(JSON.stringify(field));
        
        expect(utils.fix.modifyFieldTag(field, 'bar')).to.eql({
          'type': 'modifyField',
          'old': field_original,
          'new': field
        });

        expect(field).to.eql({
          tag: 'bar'
        });

      });

    });
    
    describe('#modifyFieldValue', function() {

      it('Should throw because the field is not a data field', function() {       
        expect(function() {
          utils.fix.modifyFieldValue({
            tag: 'foobar',
            subfields: []
          }, 'foobar');
        }).to.throw(Error, /^Field is not a control field$/);
      });

      it("Should modify the field's value and return the expected object", function() {

        var field = {
          tag: 'bar',
          value: 'foo'
        };
        
        expect(utils.fix.modifyFieldValue(field, 'fu')).to.eql({
          'type': 'modifyField',
          'old': {
            tag: 'bar',
            value: 'foo'
          },
          'new': field
        });

        expect(field).to.eql({
          tag: 'bar',
          value: 'fu'
        });

      });

    });
    
    describe('#addSubfield', function() {

      it('Should throw because the field is not a variable field', function() {
        expect(function() {
          utils.fix.addSubfield({});
        }).to.throw(Error, /^Field is not a variable field$/);
      });

      it('Should add the subfield and return the expected object', function() {

        var field = {
          tag: 'foobar',
          subfields: []
        },
        subfield = {
          code: 'foo',
          value: 'bar'
        };

        expect(utils.fix.addSubfield(field, subfield)).to.eql({
          type: 'addSubfield',
          field: field,
          subfield: subfield
        });
        expect(field.subfields).to.eql([subfield]);

      });

    });
    
    describe('#removeSubfield', function() {

      it('Should throw because the field is not a variable field', function() {
        expect(function() {
          utils.fix.removeSubfield({});
        }).to.throw(Error, /^Field is not a variable field$/);
      });

      it('Should remove the subfield and return the expected object', function() {

        var subfield = {
          code: 'foo',
          value: 'bar'
        },
        field = {
          tag: 'foobar',
          subfields: [subfield]
        };

        expect(utils.fix.removeSubfield(field, subfield)).to.eql({
          type: 'removeSubfield',
          field: field,
          subfield: subfield
        });
        expect(field.subfields.length).to.equal(0);

      });

    });
    
    describe('#modifySubfieldCode', function() {

      it("Should modify the subfield's code and return the expected object", function() {

        var subfield = {
          code: 'foo',
          value: 'bar'
        },
        field = {
          tag: 'foobar',
          subfields: [subfield]
        },
        field_original = JSON.parse(JSON.stringify(field));

        expect(utils.fix.modifySubfieldCode(field, subfield, 'fu')).to.eql({
          'type': 'modifyField',
          'old': field_original,
          'new': field
        });
        expect(field).to.eql({
          tag: 'foobar',
          subfields: [{
            code: 'fu',
            value: 'bar'
          }]
        });

      });

    });
    
    describe('#modifySubfieldValue', function() {

      it("Should modify the subfield's value and return the expected object", function() {

        var subfield = {
          code: 'bar',
          value: 'fu'
        },
        field = {
          tag: 'foobar',
          subfields: [subfield]
        },
        field_original = JSON.parse(JSON.stringify(field));

        expect(utils.fix.modifySubfieldValue(field, subfield, 'fu')).to.eql({
          'type': 'modifyField',
          'old': field_original,
          'new': field
        });
        expect(field).to.eql({
          tag: 'foobar',
          subfields: [{
            code: 'bar',
            value: 'fu'
          }]
        });

      });

    });

    describe('#modifySubfields', function() {

      it('Should throw because the field is not a variable field', function() {
        expect(function() {
          utils.fix.modifySubfields({});
        }).to.throw(Error, /^Field is not a variable field$/);
      });

      it('Should modify subfields and return the expected object', function() {

        var spy_modify_callback = simple.spy(function(subfield) {
          if (subfield.code[0] === 'f') {
            subfield.code = 'fubar';
            subfield.value = '0';
          }
        }),
        field =  {
          tag: 'foobar',
          subfields: [
            {
              code: 'foo',
              value: '1'
            },
            {
              code: 'bar',
              value: '2'
            },
            {
              code: 'fu',
              value: '3'
            }
          ]
        },
        field_original = JSON.parse(JSON.stringify(field));

        expect(utils.fix.modifySubfields(field, spy_modify_callback)).to.eql({
          'type': 'modifyField',
          'old': field_original,
          'new': field
        });
        expect(field).to.eql({
          tag: 'foobar',
          subfields: [
            {
              code: 'fubar',
              value: '0'
            },
            {
              code: 'bar',
              value: '2'
            },
            {
              code: 'fubar',
              value: '0'
            }
          ]
        });

        expect(spy_modify_callback.callCount).to.equal(3);
        expect(spy_modify_callback.calls[0].args[0]).to.eql(field.subfields[0]);
        expect(spy_modify_callback.calls[1].args[0]).to.eql(field.subfields[1]);
        expect(spy_modify_callback.calls[2].args[0]).to.eql(field.subfields[2]);

      });

    });
    
  });

}
