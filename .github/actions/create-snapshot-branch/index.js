const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
    const token = core.getInput('GITHUB_TOKEN');
    const issue = core.getInput('ISSUE');


    const octokit = github.getOctokit(token);
    
    // Get PR information
    const {data} = await octokit.rest.pulls.get({
        pull_number: issue,
        ...github.context.repo,
    })

    // Get branch information
    let branch = data.head.ref;
    branch = branch.replace('refs/heads/', '');
    const lastCommit = data.head.sha;


    const snapshotBranch = `refs/heads/snapshot-release/${branch}`;

    console.log('snapshot branch', snapshotBranch)


    // Check if branch exists
    try {
        const response = await octokit.rest.repos.getBranch({
            ...github.context.repo,
            branch: snapshotBranch,
        });

        console.log('response', response);
    } catch (error) {
        console.log('error', error);
        if (error.name === 'HttpError' && error.status === 404){
            // if branch does not exist, create new branch w/ snapshot PR commit
            const response = await octokit.rest.git.createRef({
                ref: snapshotBranch,
                sha: lastCommit,
                ...github.context.repo,
            })

            console.log('response data', response.data)

            return response?.data.ref === ref;
        }
        else {
            throw Error(error);
          }
    }


    // If it doesn't exist, create it

    // If it does exist, delete and recreate so we have the latest commits.
    
    // const response = await octokit.rest.git.createRef({
    //     ref: 'snapshot-release',
    //     sha: sha || context.sha,
    //     ...github.context.repo,
    //   });

    //   console.log('response', response?.data)

}

main().catch((err) => core.setFailed(err.message));


// 1. Get branch name
// 2. Create new branch with same name
// 3. Push branch to remote
// 4. Add comment to current PR 
// <-- makes sense for us to 