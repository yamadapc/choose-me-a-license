#!/usr/bin/env node
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

  var copyrightHoldersQuestion = {
    message: 'Copyright Holders',
    name: 'copyrightHolders',
    type: 'input',
    default: '<copyright holders>'
  };

  var copyrightYearQuestion = {
    message: 'Year',
    name: 'copyrightYear',
    type: 'input',
    default: new Date().getFullYear(),
  };

  inquirer.prompt([
    dirQuestion,
    licenseQuestion,
    copyrightHoldersQuestion,
    copyrightYearQuestion
  ], function(answers) {
    if(answers.directory.indexOf('/') !== 0) {
      answers.directory = path.join(process.cwd(), answers.directory);
    }
    copyLicense(answers);
  });
}

function copyLicense(answers, force) {
  var licensePath = path.join(LICENSES_DIR, answers.license);
  var targetPath = path.join(answers.directory, 'LICENSE');

  if(!force && fs.existsSync(targetPath)) {
    inquirer.prompt([
      {
        type: 'confirm',
        message: targetPath + ' exists. Do you want to overwrite it?',
        name: 'replace',
      },
    ], function(answers2) {
      if(answers2.replace) {
        copyLicense(answers, true);
      } else {
        process.exit(1);
      }
    });
    return;
  }

  var license = fs.readFileSync(licensePath).toString();
  license = license.replace('<copyright holders>', answers.copyrightHolders);
  license = license.replace('<year>', answers.copyrightYear);
  fs.writeFileSync(targetPath, license);
  console.log('Done!');
  process.exit(0);
}
