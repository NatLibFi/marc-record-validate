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
          field: JSON.parse(JSON.stringify(field))
        };

      },
      removeField: function(record, field)
      {

        record.fields.splice(record.fields.indexOf(field), 1);

        return {
          type: 'removeField',
          field: JSON.parse(JSON.stringify(field))
        };

      },
      modifyFieldTag: function(field, tag)
      {

        var result = {
          'type': 'modifyFieldTag',
          'old': field.tag,
          'new': tag
        };

        field.tag = tag;

        return result;

      },
      modifyFieldValue: function(field, value)
      {

        var result = {
          'type': 'modifyFieldValue',
          'old': field.value,
          'new': value
        };

        if (field.hasOwnProperty('subfields')) {
          throw new Error('Field is not a control field');
        } else {

          field.value = value;
          
          return result;

        }

      },
      addSubfield: function(field, subfield)
      {

        field.subfields.push(subfield);

        return {
          type: 'addSubfield',
          subfield: JSON.parse(JSON.stringify(subfield))
        };

      },
      removeSubfield: function(field, subfield)
      {
        
        field.subfields.splice(field.subfields.indexOf(subfield), 1);
        
        return {
          type: 'removeSubfield',
          subfield: JSON.parse(JSON.stringify(subfield))
        };

      },
      modifySubfieldCode: function(subfield, code)
      {

        var subfield_orig = JSON.parse(JSON.stringify(subfield));

        subfield.code = code;

        return {
          'type': 'modifySubfieldCode',
          'old': subfield_orig,
          'new': JSON.parse(JSON.stringify(subfield))
        };

      },
      modifySubfieldValue: function(subfield, value)
      {

        var subfield_orig = JSON.parse(JSON.stringify(subfield));

        subfield.value = value;

        return {
          'type': 'modifySubfieldValue',
          'old': subfield_orig,
          'new': JSON.parse(JSON.stringify(subfield))
        };
      }
    }
  };

}
