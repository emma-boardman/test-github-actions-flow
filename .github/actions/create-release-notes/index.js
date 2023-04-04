const {getOctokitOptions, GitHub} = require('@actions/github/lib/utils');
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const main = async () => {
  const token = core.getInput('GITHUB_TOKEN');
  const tag = core.getInput('PUSHED_TAG');

  console.log('tag', tag);

  const octokit = github.getOctokit(token);

  const [version, packageName] = tag.split('@');
  const [_, packageDir] = packageName.split('/');

  console.log('version', version);
  console.log('packageName', packageName);
  console.log('packageDir', packageDir);

  // get the package changelog
  let changelogFileName = path.join('packages', packageDir, 'CHANGELOG.md');

  // read Changelog file content
  let changelogContent = await fs.readFile(changelogFileName, 'utf8');

  // Extract the latest release content
  const newVersionIndex = changelogContent.indexOf(version) + 1;
  const lastVersionIndex =
    changelogContent.indexOf('\n## ', newVersionIndex + 1) - 1;
  const changelogEntry = changelogContent.substring(
    newVersionIndex,
    lastVersionIndex,
  );

  console.log('changelogEntry', changelogEntry);

  if (!changelogEntry) {
    // we can find a changelog but not the entry for this version
    // if this is true, something has probably gone wrong
    throw new Error(`Could not find changelog entry for ${tag}`);
  }



  await octokit.rest.repos.createRelease({
    name: tag,
    tag_name: tag,
    body: changelogEntry,
    ...github.context.repo,
  });
};

main().catch((err) => core.setFailed(err.message));
