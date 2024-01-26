const core = require('@actions/core');
const fs = require('fs');

const main = async () => {
  const configFilePath = core.getInput('CONFIG_PATH');
  const originalConfigContent = core.getInput('CONFIG_CONTENT');

  try {
    fs.writeFileSync(configFilePath, originalConfigContent);
  } catch (error) {
    core.setFailed(`Error restoring changelog path: ${error.message}`);
  }
};

main().catch((err) => core.setFailed(err.message));