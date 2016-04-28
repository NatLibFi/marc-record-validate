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
      '../lib/main'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('chai'),
      require('simple-mock'),
      require('marc-record-js'),
      require('../lib/main')
    );
  }

}(this, factory));

function factory(chai, simple, MarcRecord, createFactory)
{

  'use strict';

  var expect = chai.expect;

  describe('validate', function() {

    it('Should be a function', function() {
      expect(createFactory).to.be.a('function');
    });

    it('Should throw because of an invalid validator factory', function() {
      expect(function() {
        createFactory([{}]);
      }).to.throw(Error, /^Invalid validator factory object at index 0$/);
    });

    it('Should return a function', function() {
      expect(createFactory([{
        name: 'foobar',
        factory: simple.stub()
      }])).be.a('function');
    });

    describe('factory', function() {

      it("Should throw because configuration doesn't validate against schema", function() {
        expect(function() {
          createFactory([{
            name: 'foobar',
            factory: simple.stub()
          }])({
            validators: 'foobar'
          });
        }).to.throw(Error, /VALIDATION_INVALID_TYPE/);
      });

      it('Should throw because of an invalid validator', function() {
        expect(createFactory([{
          name: 'foo',
          factory: simple.stub().returnWith('bar')
        }])).to.throw(Error, /^Invalid validator 'foo'$/);
      });

      it('Should throw because validator cannot be found', function() {
        expect(function() {
          createFactory([])({
            validators: ['foo']
          });
        }).to.throw(Error, /^Validator 'foo' cannot be found$/);
      });

      it('Should return a function', function() {

        var spy_factory = simple.spy().returnWith({
          validate: simple.stub().returnWith([])
        });

        expect(createFactory([{
          name: 'foo',
          factory: spy_factory
        }])()).to.be.a('function');

        expect(spy_factory.called).to.be.ok/* jshint -W030 */;

      });

      it('Should return a function (Validator instantiated with options)', function() {

        var spy_factory = simple.spy().returnWith({
          validate: simple.stub().returnWith([])
        });

        expect(createFactory([{
          name: 'foo',
          factory: spy_factory
        }])({
          validators: [{
            name: 'foo',
            options: 'bar'
          }]
        })).to.be.a('function');

        expect(spy_factory.called).to.be.ok/* jshint -W030 */;
        expect(spy_factory.calls[0].args[0]).to.equal('bar');

      });

      describe('function', function() {

        it('Should throw because record is not a prototype of MarcRecord', function() {
          expect(createFactory([{
            name: 'foo',
            factory: simple.stub().returnWith({
              validate: simple.stub().returnWith([])
            })
          }])()).to.throw(Error, /^Record is not a prototype of MarcRecord$/);
        });

        it("Should throw because validate results don't validate against schema", function() {
          expect(function() {
            createFactory([{
              name: 'foo',
              factory: simple.stub().returnWith({
                validate: simple.stub().returnWith()
              })
            }])()(new MarcRecord());
          }).to.throw(Error, /^Validating validate results failed: /);
        });

        it('Should run all validators and return no messages for validation', function() {
          
          var spy_validate = simple.spy().returnWith([]);

          expect(createFactory([{
            name: 'foo',
            factory: simple.stub().returnWith({
              validate: spy_validate
            })
          }])()(new MarcRecord())).to.eql({
            failed: false,
            validators: {
              foo: {
                validate: []
              }
            }
          });

          expect(spy_validate.callCount).to.equal(1);

        });
        
        it('Should run some validators and return only warning messages', function() {

          var spy_validate1 = simple.spy().returnWith([{
            type: 'warning',
            message: 'foobar1'
          }]),
          spy_validate2 = simple.spy().returnWith([{
            type: 'error',
            message: 'foobar2'
          }]);

          expect(createFactory([
            {
              name: 'foobar1',
              factory: simple.stub().returnWith({
                validate: spy_validate1
              })
            },
            {
              name: 'foobar2',
              factory: simple.stub().returnWith({
                validate: spy_validate2
              })
            },
          ])({
            validators: ['foobar1']
          })(new MarcRecord())).to.eql({
            failed: false,
            validators: {
              foobar1: {
                validate: [{
                  type: 'warning',
                  message: 'foobar1'
                }]
              }
            }
          });

          expect(spy_validate1.callCount).to.equal(1);
          expect(spy_validate2.callCount).to.equal(0);

        });

        it('Should run validators and fail because of error messages', function() {

          var spy_validate1 = simple.spy().returnWith([{
            type: 'warning',
            message: 'foobar1'
          }]),
          spy_validate2 = simple.spy().returnWith([{
            type: 'error',
            message: 'foobar2'
          }]),
          spy_validate3 = simple.spy().returnWith([{
            type: 'info',
            message: 'foobar3'
          }]);


          expect(createFactory([
            {
              name: 'foobar1',
              factory: simple.stub().returnWith({
                validate: spy_validate1
              })
            },
            {
              name: 'foobar2',
              factory: simple.stub().returnWith({
                validate: spy_validate2
              })
            },
            {
              name: 'foobar3',
              factory: simple.stub().returnWith({
                validate: spy_validate3
              })
            },
          ])()(new MarcRecord())).to.eql({
            failed: true,
            validators: {
              foobar1: {
                validate: [{
                  type: 'warning',
                  message: 'foobar1'
                }]
              },
              foobar2: {
                validate: [{
                  type: 'error',
                  message: 'foobar2'
                }]
              }
            }
          });
          
          expect(spy_validate1.callCount).to.equal(1);
          expect(spy_validate2.callCount).to.equal(1);
          expect(spy_validate3.callCount).to.equal(0);

        });

        it('Should run validators and not fail because failOnError is false', function() {

          var spy_validate1 = simple.spy().returnWith([{
            type: 'warning',
            message: 'foobar1'
          }]),
          spy_validate2 = simple.spy().returnWith([{
            type: 'error',
            message: 'foobar2'
          }]),
          spy_validate3 = simple.spy().returnWith([{
            type: 'info',
            message: 'foobar3'
          }]);

          expect(createFactory([
            {
              name: 'foobar1',
              factory: simple.stub().returnWith({
                validate: spy_validate1
              })
            },
            {
              name: 'foobar2',
              factory: simple.stub().returnWith({
                validate: spy_validate2
              })
            },
            {
              name: 'foobar3',
              factory: simple.stub().returnWith({
                validate: spy_validate3
              })
            },
          ])({
            failOnError: false
          })(new MarcRecord())).to.eql({
            failed: false,
            validators: {
              foobar1: {
                validate: [{
                  type: 'warning',
                  message: 'foobar1'
                }]
              },
              foobar2: {
                validate: [{
                  type: 'error',
                  message: 'foobar2'
                }]
              },
              foobar3: {
                validate: [{
                  type: 'info',
                  message: 'foobar3'
                }]
              }
            }
          });

          expect(spy_validate1.callCount).to.equal(1);
          expect(spy_validate2.callCount).to.equal(1);
          expect(spy_validate3.callCount).to.equal(1);

        });

        it("Should throw because fix results don't validate against schema", function() {
          expect(function() {
            createFactory([{
              name: 'foobar',
              factory: simple.stub().returnWith({
                fix: simple.stub(),
                validate: simple.stub().returnWith([{
                  type: 'warning',
                  message: 'foobar'
                }])
              })
            }])({
              fix: true
            })(new MarcRecord());
          }).to.throw(Error, /^Validating fix results failed: /);
        });

        it('Should run validators and fix the record because fix is true', function() {
          
          var record = new MarcRecord({
            leader: '',
            fields: [{
              tag: 'bar',
              value: 'foo'
            }]
          }),
          spy_validate = simple.spy().returnWith([{
            type: 'warning',
            message: 'foobar'
          }]),
          spy_fix = simple.spy(function(rec) {

            rec.fields[0].value = 'fu';

            return [{
              'type': 'modifyField',
              'old': {
                tag: 'bar',
                value: 'foo'
              },
              'new': {
                tag: 'bar',
                value: 'fu'
              }
            }];

          });

          expect(createFactory([{
            name: 'foobar',
            factory: simple.stub().returnWith({
              validate: spy_validate,
              fix: spy_fix
            })
          }])({
            fix: true
          })(record)).to.eql({
            failed: false,
            validators: {
              foobar: {
                validate: [{
                  type: 'warning',
                  message: 'foobar'
                }],
                fix: [{
                  'type': 'modifyField',
                  'old': {
                    tag: 'bar',
                    value: 'foo'
                  },
                  'new': {
                    tag: 'bar',
                    value: 'fu'
                  }
                }]
              }
            }
          });
          
          expect(spy_validate.callCount).to.equal(1);
          expect(spy_fix.callCount).to.equal(1);
          expect(record.toJsonObject()).to.eql({
            leader: '',
            fields: [{
              tag: 'bar',
              value: 'fu'
            }]
          });

        });

      });

    });

  });

}
