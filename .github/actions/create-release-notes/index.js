
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

const main = async () => {
  const token = core.getInput('GITHUB_TOKEN');
  const tag = core.getInput('PUSHED_TAG').replace('refs/tags/', '');

  const octokit = github.getOctokit(token);

  const [version, packageName] = tag.split('@');
  const [_, packageDir] = packageName.split('/');


  // get the package changelog
  const changelogFileName = path.join(
    __dirname,
    '../../..',
    'packages', 
    packageDir, 
    'CHANGELOG.md',
  );

  // read Changelog file content
  let changelogContent;
  try {
    changelogContent = fs.readFileSync(changelogFileName).toString();

    if(changelogContent) {

     const releaseNotes = await getReleaseNotes();

     return releaseNotes ? await createReleaseNotes(releaseNotes) : null;
    }

  } catch(error){
    core.setFailed("Could not find Changelog entry for Version tag at file path:", changelogFileName)
  }

  async function getReleaseNotes(){
     // Extract the latest release content
  let newVersionIndex = changelogContent.indexOf(`\n## ${version.replace(/^v/, '')}`);

  if (newVersionIndex === -1){
    core.setFailed(`No Changelog entries found for ${tag}`);
    return null;
  } 
  const lastVersionIndex =
    changelogContent.indexOf('\n## ', newVersionIndex + 1);
  const changelogEntry = changelogContent.substring(
    newVersionIndex,
    lastVersionIndex,
  );

  if (!changelogEntry) {
    // we can find a changelog but not the entry for this version
    // if this is true, something has probably gone wrong
    throw new Error(`Could not find changelog entry for ${tag}`);
  }

  return changelogEntry;

  }

  async function createReleaseNotes(releaseNotes){

    await octokit.rest.repos.createRelease({
      name: tag,
      tag_name: tag,
      body: releaseNotes,
      ...github.context.repo,
    });
  }

 
};

main().catch((err) => core.setFailed(err.message));
