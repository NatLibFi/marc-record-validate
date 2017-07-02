/**
 *
 * @licstart  The following is the entire license notice for the JavaScript code in this file. 
 *
 * Validate and fix MARC records
 *
 * Copyright (c) 2014-2017 University Of Helsinki (The National Library Of Finland)
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

  var chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  simple = require('simple-mock'),
  mock_fs = require('mock-fs'),
  cli = require('../../lib/generate-validate-bundle-cli');

  describe('generate-validate-bundle-cli', function() {

    afterEach(mock_fs.restore);

    it('Should be a function', function() {
      expect(cli).to.be.a('function');
    });

    it('Should print usage instructions to stderr', function() {

      var stderr;

      expect(cli('foobar', [], {        
        error: function(message) {
          stderr = message;
        }
      })).to.equal(-1);

      expect(stderr).to.match(/^USAGE: foobar/);

    });

    it('Should print usage instructions to stderr as explicitly requested', function() {

      var stderr;

      expect(cli('foobar', ['--help'], { 
        error: function(message) {
          stderr = message;
        }
      })).to.equal(-1);

      expect(stderr).to.match(/^USAGE: foobar/);

    });

    it('Should succesfully write output to a file', function() {

      var fixture = fs.readFileSync('test/nodejs/fixtures/output_empty.txt', {encoding: 'utf8'});

      mock_fs();

      expect(cli(undefined, ['foobar'], {
        error: simple.stub()
      })).to.equal(undefined);
      
      expect(fs.readFileSync('foobar', {encoding: 'utf8'})).to.equal(fixture);

    });

    it('Should use the specified directory', function() {

      var fixture = fs.readFileSync('test/nodejs/fixtures/output.txt', {encoding: 'utf8'});

      mock_fs({
        foo: {},
        fu: {          
          'foo.js': '',
          'bar.js': ''
        }
      });

      expect(cli(undefined, ['foo/bar', '-d', 'fu'], new console.Console(process.stdout, process.stderr))).to.equal(undefined);      
      expect(fs.readFileSync('foo/bar', {encoding: 'utf8'})).to.equal(fixture);

    });

    it('Should attempt to find the files recursively', function() {

      var fixture = fs.readFileSync('test/nodejs/fixtures/output_recursive.txt', {encoding: 'utf8'});

      mock_fs({
        foo: {},
        fu: {          
          'foo.js': '',
          'bar.js': '',
          'bar': {
            'fubar.js': ''
          }
        }
      });

      expect(cli(undefined, ['foo/bar', '-d', 'fu', '--recursive'], new console.Console(process.stdout, process.stderr))).to.equal(undefined);      
      expect(fs.readFileSync('foo/bar', {encoding: 'utf8'})).to.equal(fixture);

    });

    it('Should use the specified mask', function() {

      var fixture = fs.readFileSync('test/nodejs/fixtures/output_mask.txt', {encoding: 'utf8'});

      mock_fs({
        'foo.bar': ''
      });

      expect(cli(undefined, ['foobar', '-m', '\\.bar$'])).to.equal(undefined);
      expect(fs.readFileSync('foobar', {encoding: 'utf8'})).to.equal(fixture);

    });

    it('Should use the specified header file', function() {

      var fixture = fs.readFileSync('test/nodejs/fixtures/output_header.txt', {encoding: 'utf8'});

      mock_fs({
        'bar': 'foobar\n\n'
      });

      expect(cli(undefined, ['foo', '-h', 'bar'])).to.equal(undefined);
      expect(fs.readFileSync('foo', {encoding: 'utf8'})).to.equal(fixture);

    });

    it('Should throw because attempting to use filter without using recursive', function() {

      var stderr;
      
      expect(cli('foobar', ['--filter', 'foobar'], { 
        error: function(message) {
          stderr = message;
        }
      })).to.equal(-1);

      expect(stderr).to.match(/^USAGE: foobar/);

    });

    it('Should use filter', function() {

      var fixture = fs.readFileSync('test/nodejs/fixtures/output_filter.txt', {encoding: 'utf8'});
      
      mock_fs({
        foo: {},
        fu: {          
          'foo.js': '',
          'bar.js': '',
          'bar': {
            'fubar.js': ''
          },
          'nodejs': {
            'fubar.js': ''
          },
          'browser': {
            'fubar.js': ''
          }
        }
      });
      
      expect(cli(undefined, ['foo/bar', '--filter', '--recursive', '-d', 'fu'])).to.equal(undefined);
      expect(fs.readFileSync('foo/bar', {encoding: 'utf8'})).to.equal(fixture);

    });

  });

}());
