#!/usr/bin/env node

const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const rimraf = require("rimraf");
const {execSync} = require('child_process');
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


rl.question(`Input the name of your project (this will be the folder created for it), \n or blank to create the project in the current directory (${process.cwd()}): \n `, function (name) {
  let finalPath = process.cwd();
  if (!name) {
    const o = execSync("git init && git remote add origin https://github.com/cobuildlab/create-nodejs-app.git && git pull origin master && git remote remove origin");
    console.log("Cloning: ", o);
  } else {
    console.log("create dir: ", name);
    finalPath = path.join([finalPath, name])
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath);
    }
    const o = execSync(`git clone https://github.com/cobuildlab/create-nodejs-app.git ${finalPath}`);
    console.log("Cloning: ", o);
    process.chdir(finalPath);
  }
  console.log("unzipping template.zip...");
  const zip = new AdmZip("./template.zip");
  zip.extractAllTo(finalPath, true);

  console.log("deleting extra stuff: ",);

  rimraf.sync("./.git");
  rimraf.sync("./README");

});

rl.on("close", function () {
  console.log("\nENJOY !!!");
  process.exit(0);
});
