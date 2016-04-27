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
    define(factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  }

}(this, factory));

function factory()
{

  'use strict';

  function clone(obj)
  {
    return JSON.parse(JSON.stringify(obj));
  }

  return {
    validate: {
      debug: function(message)
      {
        return {
          type: 'debug',
          message: message
        };
      },
      info: function(message)
      {
        return {
          type: 'info',
          message: message
        };
      },
      warning: function(message)
      {
        return {
          type: 'warning',
          message: message
        };
      },
      error: function(message)
      {
        return {
          type: 'error',
          message: message
        };
      }
    },
    fix: {
      modifyLeader: function(record, value)
      {

        var result = {
          type: 'modifyLeader',
          oldValue: record.leader,
          newValue: value
        };

        record.leader = value;

        return result;

      },
      addField: function(record, field)
      {

        record.insertField(field);

        return {
          type: 'addField',
          field: clone(field)
        };

      },
      removeField: function(record, field)
      {

        record.fields.splice(record.fields.indexOf(field), 1);

        return {
          type: 'removeField',
          field: clone(field)
        };

      },
      addSubfield: function(field, subfield)
      {

        field.subfields.push(subfield);

        return {
          type: 'addSubfield',
          field: clone(field),
          subfield: clone(subfield)
        };

      },
      removeSubfield: function(field, subfield)
      {
        
        field.subfields.splice(field.subfields.indexOf(subfield), 1);
        
        return {
          type: 'removeSubfield',
          field: clone(field),
          subfield: clone(subfield)
        };

      },
      modifyFieldTag: function(field, tag)
      {

        var field_original = clone(field);

        field.tag = tag;

        return {
          'type': 'modifyField',
          'old': field_original,
          'new': clone(field)
        };

      },
      modifyFieldValue: function(field, value)
      {

        var field_original = clone(field);

        if (field.hasOwnProperty('subfields')) {
          throw new Error('Field is not a control field');
        } else {

          field.value = value;

          return {
            'type': 'modifyField',
            'old': field_original,
            'new': clone(field)
          };

        }

      },
      modifySubfieldCode: function(field, subfield, code)
      {

        var field_original = clone(field);

        subfield.code = code;

        return {
          'type': 'modifyField',
          'old': field_original,
          'new': clone(field)
        };

      },
      modifySubfieldValue: function(field, subfield, value)
      {

        var field_original = JSON.parse(JSON.stringify(field));

        subfield.value = value;

        return {
          'type': 'modifyField',
          'old': field_original,
          'new': clone(field)
        };
      }
    }
  };

}
