const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('GITHUB_TOKEN');
const issue = core.getInput('ISSUE');
const octokit = github.getOctokit(token);

const main = async () => {
    await createReleaseBranch(octokit);

}

async function createReleaseBranch(octokit){
    console.log('do i have access to github context?', github.context.repo);

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

    // Check if branch exists
    try {
         await octokit.rest.repos.getBranch({
            ...github.context.repo,
            branch: snapshotBranch,
        });

        // console.log('what is returned if a branch is found?', getBranchData);

        // if branch exists, delete and recreate with latest commit
        const {data: deleteRefData} = await octokit.rest.git.deleteRef({
            ref: snapshotBranch,
            ...github.context.repo,
        })
        console.log('what is returned if a branch deleted?', deleteRefData);

        // Finally, create fresh branch with latest commit
        // await createBranchRef(snapshotBranch, lastCommit);

    } catch (error) {
        // if branch does not exist, create new branch w/ snapshot PR commit
        if (error.name === 'HttpError' && error.status === 404){
            console.log(`no branch called ${snapshotBranch}`)
            await createBranchRef(snapshotBranch, lastCommit);
        }
        else {
            console.log("different error")
            throw Error(error);
          }
    }

    }

    async function createBranchRef(snapshotBranch, lastCommit){
        const response = await octokit.rest.git.createRef({
            ref: snapshotBranch,
            sha: lastCommit,
            ...github.context.repo,
        })
        return response?.data.ref === lastCommit ? console.log("Snapshot branch created") : console.log("Error creating snapshot branch", response?.data)

    }

main().catch((err) => core.setFailed(err.message));
