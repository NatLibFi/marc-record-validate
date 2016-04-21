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
      './validate',
      './validators/008-and-041-fix-language',
      './validators/008-fix-country',
      './validators/020-q-fixer',
      './validators/020-to-022',
      './validators/337-missing-media-type-fin',
      './validators/337-missing-media-type-swe',
      './validators/fennica-040',
      './validators/fennica-042',
      './validators/fennica-low'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./validate'),
      require('./validators/008-and-041-fix-language'),
      require('./validators/008-fix-country'),
      require('./validators/020-q-fixer'),
      require('./validators/020-to-022'),
      require('./validators/337-missing-media-type-fin'),
      require('./validators/337-missing-media-type-swe'),
      require('./validators/fennica-040'),
      require('./validators/fennica-042'),
      require('./validators/fennica-low')
    );
  }

}(this, factory));

function factory()
{

  'use strict';

  return arguments[0].call(Array.prototype.map.call(arguments, function(arg) {
    return arg;
  }));

}
