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
    const snapshotRef = `heads/snapshot-release/${branch}`;

    // Check if branch exists
    try {
         await octokit.rest.repos.getBranch({
            ...github.context.repo,
            branch: snapshotBranch,
        });

        // if branch exists, delete and recreate with latest commit
        await octokit.rest.git.deleteRef({
            ref: snapshotRef,
            ...github.context.repo,
        })
        await createBranchRef(snapshotBranch, lastCommit);

    } catch (error) {
        // if branch does not exist, create new branch w/ snapshot PR commit
        if (error.name === 'HttpError' && error.status === 404){
            await createBranchRef(snapshotBranch, lastCommit);
        }
        else {
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
