const fs = require('fs');
const { execSync } = require('child_process');
const packageJson = require('../package.json');

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const versionInfo = {
  version: packageJson.version,
  commitHash,
  buildTime: new Date().toISOString()
};

fs.writeFileSync('src/version.json', JSON.stringify(versionInfo, null, 2));
console.log('Version info written to src/version.json');
