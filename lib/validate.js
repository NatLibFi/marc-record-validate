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
      'es6-polyfills/lib/polyfills/object',
      'jjv/lib/jjv',
      'jjve',
      'marc-record-js',
      'requirejs-plugins/src/json!../resources/configuration-schema.json',
      'requirejs-plugins/src/json!../resources/validate-results-schema.json',
      'requirejs-plugins/src/json!../resources/fix-results-schema.json'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('es6-polyfills/lib/polyfills/object'),
      require('jjv'),
      require('jjve'),
      require('marc-record-js'),
      require('../resources/configuration-schema.json'),
      require('../resources/validate-results-schema.json'),
      require('../resources/fix-results-schema.json')
    );
  }

}(this, factory));

function factory(Object, jjv, jjve, MarcRecord, schema_configuration, schema_validate_results, schema_fix_results)
{

  'use strict';

  return function(validators)
  {

    function validateDocument(schema, doc)
    {
      
      var env = jjv(),
      je = jjve(env),
      errors = env.validate(schema, doc, {
        useDefault: true
      });
      
      if (errors) {
        throw new Error(JSON.stringify(je(schema, doc, errors), undefined, 4));
      }
      
    }

    function validateConfiguration(data)
    {
      try {
        validateDocument(schema_configuration, data);
      } catch (e) {
        e.message = 'Validating configuration failed: ' + e.message;
        throw e;
      }
    }

    function validateValidateResults(data)
    {
      try {
        validateDocument(schema_validate_results, data);
      } catch (e) {
        e.message = 'Validating validate results failed: ' + e.message;
        throw e;
      }
    }

    function validateFixResults(data)
    {
      try {
        validateDocument(schema_fix_results, data);
      } catch (e) {
        e.message = 'Validating fix results failed: ' + e.message;
        throw e;
      }
    }

    function parseValidators()
    {
      if (!Array.isArray(validators)) {
        throw new Error('Validators argument is not an array');
      } else {
        return validators.reduce(function(result, validator, index) {

          var obj = {};

          if (typeof validator === 'object' && typeof validator.name === 'string' && typeof validator.validate === 'function') {

            obj[validator.name] = {
              validate: validator.validate
            };
            
            if (typeof validator.fix === 'function') {
              obj[validator.name].fix = validator.fix;
            }

            return Object.assign(result, obj);

          } else {
            throw new Error('Invalid validator at index ' + index);
          }

        }, {});
      }
    }

    validators = parseValidators();

    return function(configuration)
    {
      
      var validators_run;

      configuration = typeof configuration === 'object' ? configuration : {};
      
      validateConfiguration(configuration);

      validators_run = configuration.validators.length === 0 ? Object.keys(validators) : Object.keys(validators).filter(function(name) {
        return configuration.validators.indexOf(name) >= 0;
      });

      return function(record)
      {

        var results = {
          failed: false,
          validators: {}
        };          

        if (!MarcRecord.prototype.isPrototypeOf(record)) {
          throw new Error('Record is not a prototype of MarcRecord');
        } else {

          validators_run.some(function(name) {

            var results_validator = validators[name].validate(record);

            validateValidateResults(results_validator);

            results.validators[name] = {
              validate: results_validator
            };

            if (results_validator.some(function(result) {
              return result.messages.some(function(message_result) {
                return message_result.type === 'error';
              });
            })) {

              if (configuration.failOnError) {
                results.failed = true;
                return 1;
              }              

            } else if (configuration.fix && typeof validators[name].fix === 'function' && results_validator.some(function(result) {
              return result.messages.some(function(message_result) {
                return message_result.type === 'warning';
              });
            })) {

              results.validators[name].fix = validators[name].fix(record);

              validateFixResults(results.validators[name].fix);

            }
            
          });

          return results;

        }

      };
      
    };

  };

}
