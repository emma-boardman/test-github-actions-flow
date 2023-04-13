
const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
  const token = core.getInput('GITHUB_TOKEN');
  const issue = core.getInput('ISSUE');
  let snapshots = core.getInput('SNAPSHOTS');

  console.log('snapshots', typeof snapshots, snapshots);

  // Snapshots are returned as a string "["@shopify/package@0.0.0-snapshot-release-20230413115708", "@shopify/package@0.0.0-snapshot-release-20230413115708"]"
  // Revert to an array:
  // (1) Remove brackets
  // (2) Remove double quotes
  // (3) Create array
  snapshots = snapshots.replace(/^\[|\]$/g, '').replace(/"/g, '').split(', '); 

  if (snapshots.length) {
    const snapshotMarkup =  snapshots.map(tag => (
        '```sh\n' +
        `yarn add ${tag}\n` +
        '```'
      )).join('\n');
    const multiple = snapshots.length > 1
    const body = (
      `🫰✨ **Thanks @${github.context.actor}! ` +
      `Your snapshot${multiple ? 's are' : ' is'} being published to [Cloudsmith](https://cloudsmith.io/~shopify/packages/?q=online-store-ui)\n\n` +
      `Test the snapshot${multiple ? 's' : ''} by updating your \`package.json\` ` +
      `with the newly published version${multiple ? 's' : ''}:\n` +
       `${snapshotMarkup}` + `\n\n` +
       `If you encounter any issues with your snapshots, look at the online-store-ui-snapshot-publish pipeline](link-when-it-exists) logs,` +
       `or reach out in [#online-store-ui](https://shopify.slack.com/archives/CJL1EMP88)\n`
    )

  const octokit = github.getOctokit(token);

  await octokit.rest.issues.createComment({
      issue_number: issue,
      body,
      ...github.context.repo,
    });

};
}

main().catch((err) => core.setFailed(err.message));
