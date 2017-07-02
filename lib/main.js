/**
 *
 * @licstart  The following is the entire license notice for the JavaScript code in this file. 
 *
 * Validate and fix MARC records
 *
 * Copyright (c) 2014-2017 University Of Helsinki (The National Library Of Finland)
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
      '@natlibfi/es6-polyfills/lib/polyfills/object',
      '@natlibfi/es6-polyfills/lib/polyfills/promise',
      '@natlibfi/es6-shims/lib/shims/array',
      'marc-record-js'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('@natlibfi/es6-polyfills/lib/polyfills/object'),
      require('@natlibfi/es6-polyfills/lib/polyfills/promise'),
      require('@natlibfi/es6-shims/lib/shims/array'),
      require('marc-record-js')
    );
  }

}(this, factory));

function factory(Object, Promise, shim_array, MarcRecord)
{

  'use strict';

  var DEFAULT_OPTIONS = {
    validators: [],
    failOnError: true,
    fix: false
  };

  return function(validators)
  {

    function checkMarcRecord(record)
    {
      if (!(typeof record === 'object' && Array.isArray(record.fields) && typeof record.get === 'function' && typeof record.toJsonObject === 'function')) {
        throw new Error('Not a valid MarcRecord instance');
      }
    }
        
    function getValidators(spec_list)
    {

      function checkValidator(name, obj)
      {
        if (!(typeof obj === 'object' && typeof obj.validate === 'function')) {
          throw new Error("Invalid validator '" + name + "'");
        } else {
          return obj;
        }
      }

      function setupValidator(validator, options)
      {
        return Object.assign({}, {
          name: validator.name
        }, checkValidator(validator.name, validator.factory(options)));
      }

      return !Array.isArray(spec_list) ? validators.map(setupValidator) : spec_list.map(function(spec) {

        var validator = shim_array.find(validators, function(validator) {
          return validator.name === spec.name;
        });
        
        if (validator) {
          return Object.assign({}, spec, checkValidator(spec.name, validator.factory(spec.options)));
        } else {
          throw new Error("Validator '" + spec.name + "' cannot be found");
        }
        
      });
      
    }

    validators.forEach(function(validator, index) {
      if (!(typeof validator === 'object' && typeof validator.name === 'string' && typeof validator.factory === 'function')) {
        throw new Error('Invalid validator factory object at index ' + index);
      }
    });

    return function(configuration)
    {

      var validators_run;

      configuration = Object.assign(JSON.parse(JSON.stringify(DEFAULT_OPTIONS)), typeof configuration === 'object' ? configuration : {});
            
      validators_run = configuration.validators.length === 0 ? getValidators() : getValidators(configuration.validators.map(function(spec) {
        return typeof spec === 'object' ? spec : {
          name: spec
        };
      }));

      return function(record)
      {

        function runValidators(validators, results)
        {

          var validator = validators.shift();

          results = results ? results : {
            failed: false,
            validators: []
          };

          if (!validator) {
            return Promise.resolve(results);
          } else {

            return validator.validate(record).then(function(results_validate) {

              var result = {
                name: validator.name,
                validate: results_validate
              };
              
              if (validator.hasOwnProperty('description')) {
                result.description = validator.description;
              }
              
              if (result.validate.some(function(result) {
                return result.type === 'error';
              })) {
                
                if (configuration.failOnError) {
                  results.failed = true;
                }
                
              } else if (configuration.fix && typeof validator.fix === 'function' && result.validate.some(function(result) {
                return result.type === 'warning';
              })) {
                
                return validator.fix(record).then(function(results_fix) {

                  result.fix = results_fix;
                  results.validators.push(result);

                  return runValidators(validators, results);

                });
                
              }

              results.validators.push(result);
              
              if (results.failed) {
                return results;
              } else {
                return runValidators(validators, results);
              }              

            });

          }

        }

        try {

          checkMarcRecord(record);
          return runValidators(validators_run.slice());

        } catch (e) {
          return Promise.reject(e);
        }
              
      };
      
    };

  };

}
