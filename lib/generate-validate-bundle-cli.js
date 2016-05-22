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

    function filterNoop()
    {
      return 1;
    }

    function filterBrowser(path_module)
    {
      return !new RegExp('/nodejs/').test(path_module);
    }
    
    function filterNodejs(path_module)
    {
      return !new RegExp('/browser/').test(path_module);
    }

    function findFiles(root)
    {
      return fs.readdirSync(root).filter(function(filename) {
        
        return !(fs.statSync(path.join(root, filename)).isDirectory() && filename[0] === '.');
        
      }).reduce(function(result, filename) {

        var filename_path = path.join(root, filename);

        if (options.recursive && fs.statSync(filename_path).isDirectory()) {

          return result.concat(findFiles(filename_path));
          
        } else if (!fs.statSync(filename_path).isDirectory() && options.mask.test(filename)) {

          filename_path = path.relative(path.dirname(options.outputFile), filename_path).replace(/\.js$/, '');
          return result.concat(new RegExp('^[./]').test(filename_path) ? filename_path : './' + filename_path);          

        } else {

          return result;

        }

      }, []);
    }

    function parseFlags(flags)
    {
      return flags.filter(function(flag) {
        switch (flag) {
        case 'recursive':
          options.recursive = 1;
          break;
        case 'filter':
          options.filter = 1;
          break;
        default:
          return 1;
        }
      });
    }

    var str_output, module_paths, module_directory_prefix,
    options = JSON.parse(JSON.stringify(DEFAULT_OPTIONS)),
    args = cliArgs(argv),
    str_usage = 'USAGE: ' + name + ' [OPTIONS] <OUTPUT_FILE>\n\n' +
      'Options:\n' + 
      '\t-d, --directory\tDirectory where validator modules are found. Defaults to current working directory\n' +
      '\t-m, --mask\tFile mask used to find module files\n' +
      '\t-h, --header\tFile to use as a header to the output module\n' + 
      '\t--recursive\tLook for validator files recursively\n' +
      "\t--filter\tInclude modules in platform-specific directories 'browser' and 'nodejs' only in the respective platform. Requires --recursive\n";
    
    if (args._.length === 0 || args._.length === 1 && args._[0] === 'help') {
      console.error(str_usage);
      return -1;
    } else {

      args._ = parseFlags(args._);
      options.outputFile = args._.shift();

      if (options.filter && !options.recursive) {
        console.error(str_usage);
        return -1;
      } else {

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
        module_paths = findFiles(options.directory);
        
        str_output = module_paths.filter(options.filter ? filterBrowser : filterNoop).reduce(function(output, module_path, index, list) {      
          return str_output += (index === 0 ? ',\n' : '') + "      '" + module_path + "'" +  (index === list.length - 1 ? '' :',\n');
        }, str_output);
        
        str_output += str_middle;
        
        str_output= module_paths.filter(options.filter ? filterNodejs : filterNoop).reduce(function(output, module_path, index, list) {
          return str_output += (index === 0 ? ',\n' : '') + "      require('" + module_path + "')" +  (index === list.length - 1 ? '' :',\n');
        }, str_output);
        
        str_output += str_tail;
        
        fs.writeFileSync(options.outputFile, str_output);
        
      }

    }
    
  };

}());
