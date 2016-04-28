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
      'es6-shims/lib/shims/array',
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
      require(      'es6-shims/lib/shims/array'),
      require('jjv'),
      require('jjve'),
      require('marc-record-js'),
      require('../resources/configuration-schema.json'),
      require('../resources/validate-results-schema.json'),
      require('../resources/fix-results-schema.json')
    );
  }

}(this, factory));

function factory(Object, shim_array, jjv, jjve, MarcRecord, schema_configuration, schema_validate_results, schema_fix_results)
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
          return Object.assign({}, {
            name: spec.name
          }, checkValidator(spec.name, validator.factory(spec.options)));
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

      configuration = typeof configuration === 'object' ? configuration : {};
      
      validateConfiguration(configuration);
      
      validators_run = configuration.validators.length === 0 ? getValidators() : getValidators(configuration.validators.map(function(spec) {
        return typeof spec === 'object' ? spec : {
          name: spec
        };
      }));

      return function(record)
      {

        var results = {
          failed: false,
          validators: {}
        };          

        if (!MarcRecord.prototype.isPrototypeOf(record)) {
          throw new Error('Record is not a prototype of MarcRecord');
        } else {

          validators_run.some(function(validator) {

            var results_validator = validator.validate(record);

            validateValidateResults(results_validator);

            results.validators[validator.name] = {
              validate: results_validator
            };

            if (results_validator.some(function(result) {
                return result.type === 'error';
            })) {

              if (configuration.failOnError) {
                results.failed = true;
                return 1;
              }              

            } else if (configuration.fix && typeof validator.fix === 'function' && results_validator.some(function(result) {
              return result.type === 'warning';
            })) {

              results.validators[validator.name].fix = validator.fix(record);

              validateFixResults(results.validators[validator.name].fix);

            }
            
          });

          return results;

        }

      };
      
    };

  };

}
