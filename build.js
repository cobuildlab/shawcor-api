#!/usr/bin/env node

const AdmZip = require('adm-zip');
const zip = new AdmZip();
zip.addLocalFolder("./template");
zip.writeZip("./template.zip");
