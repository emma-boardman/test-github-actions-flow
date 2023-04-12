const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
    const token = core.getInput('GITHUB_TOKEN');
    const issue = core.getInput('ISSUE');
    const snapshots = core.getInput('SNAPSHOTS');

    console.log('issue', issue);

    const octokit = github.getOctokit(token);

    octokit.rest.issues.createComment({
        issue_number: issue,
        body: `HI! ${snapshots}`,
      });

}

main().catch((err) => core.setFailed(err.message));