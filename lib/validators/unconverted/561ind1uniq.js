/*
 *
 * 561ind1uniq.js -- shift ISSN from 020 to it's rightful place as 022
 * 
 * Copyright (c) Kansalliskirjasto 2015
 * All Rights Reserved.
 *
 * @author: Nicholas Volk <nicholas.volk@helsinki.fi>
 * with load of open source (MIT) stuff from https://code.google.com/p/isbnjs/...
 *

 */

define([
	"core/RecordModel",
	"core/Validation",
	"core/L",
	], function (RecordModel, Validation, L) {
		"use strict";

		var debug = 1;


		function requiresAction(recordModel, field) {
			if ( field.tag !== '561' ) { return 0; }

      if ( field.indicator1 !== ' ' ) { return 0; }

      var a = RecordModel.fieldToString(field).substr(1);

      var sisters = recordModel.getFieldsByTag(field.tag);
      var i;
      for ( i=0; i < sisters.length; i++ ) {
        var sis = sisters[i];
        if ( sis.indicator1 === '1' ) {

          var b = RecordModel.fieldToString(sis).substr(1);
          if ( a === b ) {
            if ( debug ) {
              console.info("561 ' "+a+"'");
            }
            return 1;
          }
        }
      } 
			return 0;
		}

		function validate(recordModel, field) {
      var result = requiresAction(recordModel, field);	
      if ( result ) {
        var msg = "561: remove almost duplicate ";
        return Validation.warning(msg, [{
          name: msg,
          description: msg + " "  + RecordModel.fieldToString(field)  
        }]);
      }
      return null;
    }


		function fix (action, recordModel, field, i) {
			var result = requiresAction(recordModel, field);
			if ( result ) {
        if ( debug ) {
          console.info("561ind1uniq fix: remove 561 ' "+RecordModel.fieldToString(field)+"'");
        }
        recordModel.deleteField(field);
        recordModel.trigger('change');
        return 1;
			}
      return 0;
		}

		Validation.registerValidatorBundle(
			"561ind1uniq",
			validate,
			fix,
			'field');
});


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
