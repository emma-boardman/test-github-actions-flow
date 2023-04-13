const core = require('@actions/core');
const fs = require('fs');
const {getPackages} = require('@manypkg/get-packages');


const main = async () => {
  console.log('hello?')
  const cwd = process.cwd();

  const {packages} = await getPackages(cwd);

  const snapshotReleases = [];
    
  for (let index = 0; index < packages.length; index++) {
      const {packageJson} = packages[index];

      const pkgName = packageJson.name;
      const localVersion = packageJson.version;

      if (localVersion.includes('snapshot')){
        snapshotReleases.push(`${pkgName}@${localVersion}`);
      }
    }

    if (!snapshotReleases.length > 0) {
      core.setFailed(
        'No snapshot releases found. Please run `yarn changeset` to add a changeset.',
      );
    }

    core.setOutput('SNAPSHOT_RELEASES', snapshotReleases);
    core.setOutput('HAS_CHANGESET', snapshotReleases.length > 0);

    // Make tags available to actions/github-script@v6, 
    fs.writeFile('snapshotTags.log', snapshotReleases, function (err) {
      if (err) {
        return console.log(`Error saving snapshot tags: ${err}`);
      }
    });
}
    
main().catch((err) => core.setFailed(err.message));
