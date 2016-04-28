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
      '../lib/validator-prototype'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('chai'),
      require('../lib/validator-prototype')
    );
  }

}(this, factory));

function factory(chai, validator_factory)
{

  'use strict';

  var expect = chai.expect;

  describe('validator-prototype', function() {
    
    it('Should be the expected object', function() {
      expect(validator_factory).to.be.an('object');
      expect(validator_factory.name).to.be.a('string');
      expect(validator_factory.factory).to.be.a('function');
    });
    
    describe('#factory', function() {
      
      it('Should return the expected object', function() {
        
        var obj = validator_factory.factory();
        
        expect(obj).to.be.an('object').and.to
          .respondTo('validate').and.to
          .respondTo('fix');
        
      });
      
      describe('object', function() {
        
        describe('#validate', function() {
          
          it('Should return an array', function() {
            expect(validator_factory.factory().validate()).to.be.an('array');
          });
          
        });
        
        describe('#fix', function() {
          
          it('Should return an array', function() {
            expect(validator_factory.factory().fix()).to.be.an('array');
          });
          
        });
        
      });

    });

  });

}
