const core = require('@actions/core');
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

    console.log('snapshot releases', snapshotReleases);

    core.setOutput('SNAPSHOT_RELEASES', snapshotReleases);
    core.setOutput('HAS_CHANGESET', snapshotReleases.length > 0);

}

main().catch((err) => core.setFailed(err.message));
