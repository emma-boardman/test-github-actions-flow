const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
    const token = core.getInput('GITHUB_TOKEN');
    const issue = core.getInput('ISSUE');
    let snapshots = core.getInput('SNAPSHOTS');

    let comment = "Hi friend! Thanks for creating a snapshot. Test the snapshots by updating your `package.json` with the newly published versions";

    console.log(typeof snapshots);

    snapshots = snapshots.replace(/"([^"]*)"/g, '$1').replace("[", "").replace("]", "").split(",");

    snapshots.forEach(function (snapshot) {

      comment += `\n \`\`\`${snapshot}\`\`\``;
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