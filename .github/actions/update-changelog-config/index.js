const core = require('@actions/core');
const {exec} = require('child_process');

const fs = require('fs');
const path = require('path');

const CHANGELOG_PKG = '@changesets/changelog-github';

const main = async () => {
  await addGlobalPackage();

  const yarnGlobalDir = await getYarnGlobalDir();

  await updateConfigPath(yarnGlobalDir.trim());
};

async function addGlobalPackage() {
  try {
    return await execCommand(`yarn global add ${CHANGELOG_PKG}@^0.4.7`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getYarnGlobalDir() {
  try {
    return await execCommand('yarn global dir');
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function updateConfigPath(yarnGlobalDir) {
  const configFilePath = path.resolve(
    __dirname,
    '../../../.changeset/config.json',
  );
  const originalConfigContent = fs.readFileSync(configFilePath, 'utf-8');

  const configObject = JSON.parse(originalConfigContent);

  const updatedChangelogPath = `${yarnGlobalDir}/node_modules/${CHANGELOG_PKG}`;
  const updatedConfigObject = {...configObject};
  updatedConfigObject.changelog[0] = updatedChangelogPath;

  fs.writeFileSync(
    configFilePath,
    JSON.stringify(updatedConfigObject, null, 2),
  );

  core.setOutput('CONFIG_PATH', configFilePath);
  core.setOutput('CONFIG_CONTENT', originalConfigContent);
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

main().catch((err) => core.setFailed(err.message));