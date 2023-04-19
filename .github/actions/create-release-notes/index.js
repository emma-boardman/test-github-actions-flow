
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

const main = async () => {
  const token = core.getInput('GITHUB_TOKEN');
  const tag = core.getInput('PUSHED_TAG').replace('refs/tags/', '');

  console.log('are multiple tags treated as individual events or arrays?', core.getInput('PUSHED_TAG'))

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

  console.log('changelog', changelogFileName);

  // read Changelog file content
  let changelogContent;
  try {
    changelogContent = fs.readFileSync(changelogFileName).toString();

    console.log('changelog content', changelogContent);
    
    if(changelogContent) {
     const releaseNotes = await getReleaseNotes();

     console.log('release notes', releaseNotes);

     await createReleaseNotes(releaseNotes);
    }

  } catch(error){
    core.setFailed("Could not find Changelog entry for Version tag", error)
  }

  async function getReleaseNotes(){
     // Extract the latest release content
  const newVersionIndex = changelogContent.indexOf(`\n## ${version.replace(/^v/, '')}`) + 1;
  const lastVersionIndex =
    changelogContent.indexOf('\n## ', newVersionIndex + 1) - 1;
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
