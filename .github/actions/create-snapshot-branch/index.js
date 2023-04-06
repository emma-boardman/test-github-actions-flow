const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
    const token = core.getInput('GITHUB_TOKEN');
    const sha = core.getInput('sha');

    console.log('sha', sha);

    console.log('context', context);

    const octokit = github.getOctokit(token);
    
    // const response = await octokit.rest.git.createRef({
    //     ref: 'snapshot-release',
    //     sha: sha || context.sha,
    //     ...github.context.repo,
    //   });

    //   console.log('response', response?.data)

}