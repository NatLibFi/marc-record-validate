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

var fs = require('fs'),
path = require('path');
template = fs.readFileSync('tools/resources/spec-template.js', {encoding: 'utf8'});

fs.readdirSync('lib/validators').filter(function(filename) {
  return !fs.statSync(path.join('lib/validators', filename)).isDirectory();
}).forEach(function(filename) {

  var name = filename.replace(new RegExp('\.js$'), ''),
  template_spec = template.replace(/FOO_TEMPLATE/g, name),
  path_test = path.join('test', 'validators', name + '.spec.js');

  if (!fs.existsSync(path_test)) {   
    fs.writeFileSync(path_test, template_spec);
  }

});
