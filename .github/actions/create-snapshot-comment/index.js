
const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
  const token = core.getInput('GITHUB_TOKEN');
  const issue = core.getInput('ISSUE');
  let snapshots = core.getInput('SNAPSHOTS');

  // Snapshots are returned as a string "["snapshot", "snapshot"]""
  // Revert to array format
  snapshots = snapshots.replace(/"([^"]*)"/g, '$1').replace("[", "").replace("]","").split(',');

  const newTags = snapshots.map(([_, tag]) => tag)
if (newTags.length) {
  const multiple = newTags.length > 1
  const body = (
    `🫰✨ **Thanks @${context.actor}! ` +
    `Your snapshot${multiple ? 's have' : ' has'} been published to [Cloudsmith](https://cloudsmith.io/~shopify/packages/?q=online-store-ui)\n\n` +
    `Test the snapshot${multiple ? 's' : ''} by updating your \`package.json\` ` +
    `with the newly published version${multiple ? 's' : ''}:\n` +
    newTags.map(tag => (
      '```sh\n' +
      `yarn add ${tag}\n` +
      '```'
    )).join('\n')
  )

  const octokit = github.getOctokit(token);

  await octokit.rest.issues.createComment({
      issue_number: issue,
      body: message,
      ...github.context.repo,
    });

};
}

main().catch((err) => core.setFailed(err.message));
