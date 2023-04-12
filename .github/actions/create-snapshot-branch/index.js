const core = require('@actions/core');
const {getExecOutput} = require('@actions/exec');
const github = require('@actions/github');

const token = core.getInput('GITHUB_TOKEN');
const issue = core.getInput('ISSUE');
const octokit = github.getOctokit(token);

const main = async () => {
    
    const branch = await createReleaseBranch(octokit);

    await createVersionCommit(octokit, branch);
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
        // if branch does not exist, create new branch with the latest commit
        if (error.name === 'HttpError' && error.status === 404){
            await createBranchRef(snapshotBranch, lastCommit);
        }
        else {
            throw Error(error);
          }
    }

    }

    async function createBranchRef(snapshotBranch, lastCommit){
        await octokit.rest.git.createRef({
            ref: snapshotBranch,
            sha: lastCommit,
            ...github.context.repo,
        })

        return snapshotBranch
    }

    async function createVersionCommit(octokit, branch){
        const versionFiles = await getUncomittedPackageVersionFiles();

        if (versionFiles.length > 0) {
            
           console.log('✅ Version files found. Creating Snapshot release');
   
           versionFiles.forEach(async (versionFile) => {
             console.log(versionFile.name);
             // Add the file
             await getExecOutput('git', ['add', versionFile.name]);
           })
           await getExecOutput('git', ['commit', '-m', 'Snapshot Version']);
           const versionCommitSHA = await getExecOutput('git', ['rev-parse', 'HEAD']);
            console.log('lastCommit', versionCommitSHA);
   
          const {data} = octokit.rest.git.updateRef({
             ref: branch = branch.replace('refs/', ''),
             sha: versionCommitSHA,
             ...github.context.repo,
           });
   
           console.log('data',data);
       }
    }

    async function getUncomittedPackageVersionFiles() {
        // output returns a string, with each file name and status seperated by linebreaks.
        const output = await getExecOutput('git', ['status', '--porcelain']);
      
        // Tranform string into an array
        let files = output.stdout.split(/\r?\n/);
        // Remove empty entry after final linebreak
        files = files.splice(0, files.length - 1);
      
        // only return files that were generated by "changeset version"
        // todo: only from packages, not github actions
        const versionFileIdentifiers = /package.json/;
        const uncomittedVersionFiles = files.filter((file) =>
          versionFileIdentifiers.test(file),
        );
      
        return uncomittedVersionFiles.map((file) => {
          // Initial Status format: XY PATH
          const fileDetails = file.replace(/^\s+/, '').split(/[ ]/);
          // Status codes: https://git-scm.com/docs/git-status
          const status = fileDetails[0];
          const name = fileDetails.pop();
      
          return {
            name,
            status,
          };
        });
      }

main().catch((err) => core.setFailed(err.message));
