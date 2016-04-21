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

(function() {

  'use strict';

  var fs = require('fs'),
  path = require('path'),
  str_output = fs.readFileSync('resources/bundle-template/head.txt', {encoding: 'utf8'}),
  module_paths = fs.readdirSync('lib/validators').filter(function(filename) {
    return !fs.statSync('lib/validators/' + filename).isDirectory();
  }).map(function(filename) {
    return './validators/' + filename.replace(/\.js$/, '');
  });

  str_output = module_paths.reduce(function(output, module_path, index) {

    return str_output += "      '" + module_path + "'" + (index === module_paths.length - 1 ? '\n' :',\n');

  }, str_output);

  str_output += fs.readFileSync('resources/bundle-template/middle.txt', {encoding: 'utf8'});

  str_output= module_paths.reduce(function(output, module_path, index) {

    return str_output += "      require('" + module_path + "')" + (index === module_paths.length - 1 ? '\n' : ',\n');

  }, str_output);

  str_output += fs.readFileSync('resources/bundle-template/tail.txt', {encoding: 'utf8'});

  fs.writeFileSync('lib/main.js', str_output);

}());
