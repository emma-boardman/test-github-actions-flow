const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
    const token = core.getInput('GITHUB_TOKEN');
    const issue = core.getInput('ISSUE');

    console.log('issue', issue);


    const octokit = github.getOctokit(token);
    
    // Get PR information
    const response = octokit.rest.issues.get({
        issue_number: issue,
        ...github.context.repo,
    })

    console.log('response', response);
    
    // const response = await octokit.rest.git.createRef({
    //     ref: 'snapshot-release',
    //     sha: sha || context.sha,
    //     ...github.context.repo,
    //   });

    //   console.log('response', response?.data)

}

main().catch((err) => core.setFailed(err.message));