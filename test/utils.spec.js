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
    define(['chai/chai', '../lib/utils', 'marc-record-js'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('chai'), require('../lib/utils'), require('marc-record-js'));
  }

}(this, factory));

function factory(chai, utils, MarcRecord)
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

      });

      describe('#info', function() {

        it('Should return the expected object', function() {
          expect(utils.validate.info('foobar')).to.eql({
            type: 'info',
            message: 'foobar'
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

      });

      describe('#error', function() {

        it('Should return the expected object', function() {
          expect(utils.validate.error('foobar')).to.eql({
            type: 'error',
            message: 'foobar'
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
          .respondTo('modifySubfieldValue');
      });
      
      describe('modifyLeader', function() {



        var record = new MarcRecord();
        
        expect(utils.fix.modifyLeader(record, 'foobar')).to.eql({
          type: 'modifyLeader',
          oldValue: '',
          newValue: 'foobar'
        });

        expect(record.leader).to.eql('foobar');

      });
      
    });
    
    describe('addField', function() {

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

    describe('removeField', function() {

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
    
    describe('modifyFieldTag', function() {

      it("Should modify the field's tag and return the expected object", function() {

        var field = {
          tag: 'foo'
        };
        
        expect(utils.fix.modifyFieldTag(field, 'bar')).to.eql({
          'type': 'modifyFieldTag',
          'old': 'foo',
          'new': 'bar'
        });

        expect(field).to.eql({
          tag: 'bar'
        });

      });

    });
    
    describe('modifyFieldValue', function() {

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
          'type': 'modifyFieldValue',
          'old': 'foo',
          'new': 'fu'
        });

        expect(field).to.eql({
          tag: 'bar',
          value: 'fu'
        });

      });

    });
    
    describe('addSubfield', function() {

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
          subfield: subfield
        });
        expect(field.subfields).to.eql([subfield]);

      });

    });
    
    describe('removeSubfield', function() {

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
          subfield: subfield
        });
        expect(field.subfields.length).to.equal(0);

      });

    });
    
    describe('modifySubfieldCode', function() {

      it("Should modify the subfield's code and return the expected object", function() {

        var subfield = {
          code: 'foo',
          value: 'bar'
        },
        subfield_new = {
          code: 'fu',
          value: 'bar'
        };

        expect(utils.fix.modifySubfieldCode(subfield, 'fu')).to.eql({
          'type': 'modifySubfieldCode',
          'old': {
            code: 'foo',
            value: 'bar'
          },
          'new': subfield_new            
        });
        expect(subfield).to.eql(subfield_new);

      });

    });
    
    describe('modifySubfieldValue', function() {

      it("Should modify the subfield's value and return the expected object", function() {

        var subfield = {
          code: 'bar',
          value: 'foo'
        },
        subfield_new = {
          code: 'bar',
          value: 'fu'
        };

        expect(utils.fix.modifySubfieldValue(subfield, 'fu')).to.eql({
          'type': 'modifySubfieldValue',
          'old': {
            code: 'bar',
            value: 'foo'
          },
          'new': subfield_new
        });
        expect(subfield).to.eql(subfield_new);

      });

    });
    
  });

}
