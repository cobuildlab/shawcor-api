#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const rimraf = require("rimraf");
const {execSync} = require('child_process');
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`create-nodejs-app:\n Input the name of your project (this will be the folder created for it), \n or blank to create the project in the current directory (${process.cwd()}): \n `, function (name) {
  let finalPath = process.cwd();
  if (!name) {
    console.log("create-nodejs-app:\n No name, cloning the template here:", finalPath);
    execSync("git init")
    execSync("git remote add origin https://github.com/cobuildlab/create-nodejs-app.git")
    execSync("git pull origin master")
  } else {
    console.log("create-nodejs-app:\n Creating dir: ", name);
    finalPath = path.join(finalPath, name)
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath);
    }
    console.log("create-nodejs-app:\n Cloning... ");
    execSync(`git clone https://github.com/cobuildlab/create-nodejs-app.git ${finalPath}`);
    console.log("create-nodejs-app:\n Changing dir to: ", finalPath);
    process.chdir(finalPath);
  }
  console.log("create-nodejs-app:\n Removing unnecessary files...",);
  rimraf.sync("./.git");
  rimraf.sync("./.github");
  rimraf.sync("./.gitignore");
  rimraf.sync("./.npmignore");
  rimraf.sync("./README.md");
  rimraf.sync("./package.json");
  rimraf.sync("./package-lock.json");
  rimraf.sync("./index.js");

  const templatePath = path.join(finalPath, "template")
  console.log("create-nodejs-app:\n Moving the template content:", finalPath, templatePath);
  execSync(`mv ${templatePath}/* .`);
  execSync(`mv ${templatePath}/.* .`);

  console.log("create-nodejs-app:\n Removing 'template' folder...",);
  rimraf.sync("./template");

  if (name)
    process.chdir(finalPath)

  console.log("create-nodejs-app:\n Initializing repo with GIT...");
  execSync(`git init`);
  console.log("create-nodejs-app:\n Installing dependencies with NPM... (This may take a few seconds or more)");
  execSync(`npm i`);

  rl.close();
});

rl.on("close", function () {
  console.log("\nENJOY !!!");
  process.exit(0);
});
