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

  var DEFAULT_OPTIONS = {
    directory: process.cwd(),
    mask: '\.js$'
  };

  var cliArgs = require('cli-args'),
  fs = require('fs'),
  path = require('path'),
  validate_module_directory = path.normalize(path.join(path.dirname(module.filename), '..')),
  str_head = fs.readFileSync(path.join(validate_module_directory, 'resources/bundle-template/head.txt'), {encoding: 'utf8'}).replace(/\s$/, ''),
  str_middle = fs.readFileSync(path.join(validate_module_directory, 'resources/bundle-template/middle.txt'), {encoding: 'utf8'}).replace(/\s$/, ''),
  str_tail = fs.readFileSync(path.join(validate_module_directory, 'resources/bundle-template/tail.txt'), {encoding: 'utf8'});

  module.exports = function(name, argv, console, std_streams)
  {

    var str_output, module_paths, module_directory_prefix,
    options = JSON.parse(JSON.stringify(DEFAULT_OPTIONS)),
    args = cliArgs(argv),
    str_usage = 'USAGE: ' + name + ' [OPTIONS] <OUTPUT_FILE>\n\n' +
      'Options:\n' + 
      '\t-d, --directory\tDirectory where modules validator modules are found. Defaults to current working directory\n' +
      '\t-m, --mask\tFile mask used to find module files\n' +
      '\t-h, --header\tFile to use as a header to the output module\n\n';
    
    if (args._.length === 0) {
      console.error(str_usage);
      return -1;
    } else {

      options.outputFile = args._[0];

      Object.keys(args).forEach(function(key) {
        switch (key) {
        case 'd':
        case 'directory':
          options.directory = args[key];
          break;
        case 'm':
        case 'mask':
          options.mask = args[key];
          break;
        case 'h':
        case 'header':
          options.headerFile = args[key];
          break;
        }
      });

      options.mask = new RegExp(options.mask);

      str_output = typeof options.headerFile === 'string' ? fs.readFileSync(options.headerFile, {encoding: 'utf8'}) + str_head : str_head;

      module_paths = fs.readdirSync(options.directory).filter(function(filename) {
        return !fs.statSync(path.join(options.directory, filename)).isDirectory() && options.mask.test(filename);
      }).map(function(filename) {

        filename = path.relative(path.dirname(options.outputFile), path.join(options.directory, filename)).replace(/\.js$/, '');

        return new RegExp('^[./]').test(filename) ? filename : './' + filename;

      });

      str_output = module_paths.reduce(function(output, module_path, index) {      
        return str_output += (index === 0 ? ',\n' : '') + "      '" + module_path + "'" +  (index === module_paths.length - 1 ? '' :',\n');
      }, str_output);
      
      str_output += str_middle;

      str_output= module_paths.reduce(function(output, module_path, index) {
        return str_output += (index === 0 ? ',\n' : '') + "      require('" + module_path + "')" +  (index === module_paths.length - 1 ? '' :',\n');
      }, str_output);

      str_output += str_tail;

      fs.writeFileSync(options.outputFile, str_output);

    }

  };

}());
