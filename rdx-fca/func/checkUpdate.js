const axios = require("axios");
const chalk = require("chalk");

const currentVersion = "1.0.0";
const packageName = "rdx-fca";
const githubRepo = "sardarrdx/rdx-fca";

const banner = (text) => chalk.cyan(text);

function checkAndUpdateVersion() {
  return new Promise((resolve) => {
    console.log(banner(`
╔═══════════════════════════════════════════════════╗
║      RDX-FCA v${currentVersion} - Sardar RDX               ║
║      Combined Best Features | Enhanced API       ║
╚═══════════════════════════════════════════════════╝
    `));
    console.log(chalk.cyan(`[RDX-FCA] Checking for updates...`));
    
    axios.get(`https://registry.npmjs.org/${packageName}/latest`)
      .then(response => {
        const latestVersion = response.data.version;
        if (latestVersion > currentVersion) {
          console.log(chalk.yellow(`[RDX-FCA] New version available: ${latestVersion}`));
          console.log(chalk.cyan(`[RDX-FCA] Run: npm install ${packageName}@latest`));
        } else {
          console.log(chalk.green(`[RDX-FCA] You are using the latest version!`));
        }
      })
      .catch(() => {
        // Silent fail for update check
      })
      .finally(() => {
        resolve(true);
      });
  });
}

module.exports = { checkAndUpdateVersion, currentVersion };
module.exports.credits = "SARDAR RDX";
