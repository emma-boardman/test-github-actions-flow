const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
    const token = core.getInput('GITHUB_TOKEN');
    const issue = core.getInput('ISSUE');
    const snapshots = core.getInput('SNAPSHOTS');

    const comment = "Hi friend! Thanks for creating a snapshot. Test the snapshots by updating your `package.json` with the newly published versions";

    snapshots.forEach(function (snapshot) {

      comment += `\n ${snapshot}`;
    });

    console.log('issue', issue);
    console.log('snapshots', snapshots);



    const octokit = github.getOctokit(token);

    octokit.rest.issues.createComment({
        issue_number: issue,
        body: comment,
        ...github.context.repo,
      });

}

main().catch((err) => core.setFailed(err.message));