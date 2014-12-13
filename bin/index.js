'use strict';
var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');

var LICENSES_DIR = path.join(__dirname, '..', 'licenses');
var AVAILABLE_LICENSES = fs.readdirSync(LICENSES_DIR);

if(!module.parent) {
  main();
}

function main() {
  var dirQuestion = {
    message: 'Target directory',
    name: 'directory',
    type: 'input',
    default: './',
  };

  var licenseQuestion = {
    message: 'License',
    name: 'license',
    type: 'list',
    choices: AVAILABLE_LICENSES,
  };

  inquirer.prompt([dirQuestion, licenseQuestion], function(answers) {
    if(answers.directory.indexOf('/') !== 0) {
      answers.directory = path.join(process.cwd(), answers.directory);
    }

    var licensePath = path.join(LICENSES_DIR, answers.license);
    var targetPath = path.join(answers.directory, 'LICENSE');

    var readable = fs.createReadStream(licensePath);
    var writable = fs.createWriteStream(targetPath);

    readable.pipe(writable)
      .on('error', function(err) {
        console.error(err);
        process.exit(err.code || 1);
      })
      .on('close', function() {
        console.log('Done!');
        process.exit(0);
      });
  });
}
