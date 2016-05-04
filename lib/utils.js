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
    define(['es6-polyfills/lib/polyfills/object'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('es6-polyfills/lib/polyfills/object'));
  }

}(this, factory));

function factory(Object)
{

  'use strict';

  function clone(obj)
  {
    return typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  function createMessage(type, message, field)
  {
    return Object.assign(
      {
        type: type,
        message: message
      },
      typeof field !== 'object' ? {} : {
        field: field
      }
    );
  }
  
  return {
    validate: {
      debug: function(message, field)
      {
        return createMessage('debug', message, clone(field));
      },
      info: function(message, field)
      {
        return createMessage('info', message, clone(field));
      },
      warning: function(message, field)
      {
        return createMessage('warning', message, clone(field));
      },
      error: function(message, field)
      {
        return createMessage('error', message, clone(field));
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
        if (!field.hasOwnProperty('subfields')) {
          throw new Error('Field is not a variable field');
        } else {

          field.subfields.push(subfield);
          
          return {
            type: 'addSubfield',
            field: clone(field),
            subfield: clone(subfield)
          };

        }
      },
      removeSubfield: function(field, subfield)
      {
        if (!field.hasOwnProperty('subfields')) {
          throw new Error('Field is not a variable field');
        } else {

          field.subfields.splice(field.subfields.indexOf(subfield), 1);
          
          return {
            type: 'removeSubfield',
            field: clone(field),
            subfield: clone(subfield)
          };

        }
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

        var field_original;

        if (field.hasOwnProperty('subfields')) {
          throw new Error('Field is not a control field');
        } else {

          field_original = clone(field);
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

        var field_original = clone(field);

        subfield.value = value;

        return {
          'type': 'modifyField',
          'old': field_original,
          'new': clone(field)
        };

      },
      modifySubfields: function(field, modifyCallback)
      {

        var field_original;

        if (!field.hasOwnProperty('subfields')) {
          throw new Error('Field is not a variable field');
        } else {

          field_original = clone(field);
          
          field.subfields.forEach(modifyCallback);
          
          return {
            'type': 'modifyField',
            'old': field_original,
            'new': clone(field)
          };

        }

      }
    }
  };

}
