const core = require('@actions/core');
const fs = require('fs');
const {getExecOutput} = require('@actions/exec');
const github = require('@actions/github');

const token = core.getInput('GITHUB_TOKEN');
const issue = core.getInput('ISSUE');
const octokit = github.getOctokit(token);

const main = async () => {
    
    const branchDetails = await createReleaseBranch(octokit);

    console.log('branch', branchDetails);

    const {branch, sha} = branchDetails;

    await createVersionCommit(octokit, branch, sha);
}

async function createReleaseBranch(octokit){

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
        return await createBranchRef(snapshotBranch, lastCommit);

    } catch (error) {
        // if branch does not exist, create new branch with the latest commit
        if (error.name === 'HttpError' && error.status === 404){
            return await createBranchRef(snapshotBranch, lastCommit);
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

        console.log('object to return: ', {branch: snapshotBranch, sha: lastCommit})

        return {branch: snapshotBranch, sha: lastCommit}
    }

    async function createVersionCommit(octokit, branch, currentCommitSha){
        const versionFiles = await getUncomittedPackageVersionFiles();

        if (versionFiles.length > 0) {
            
           console.log('✅ Version files found. Creating Snapshot commit', versionFiles);

           // Get commit tree sha
           const { data: commitData } = await octokit.rest.git.getCommit({
            ...github.context.repo,
            commit_sha: currentCommitSha,
          })

          const currentCommitTreeSha = commitData.tree.sha;

          console.log('✅ Retrived commit tree SHA', currentCommitTreeSha);

          const versionFileBlobs = await Promise.all(versionFiles.map(createBlobForFile(octokit)));
          const pathsForBlobs = versionFiles.map(path => path.relative(path, __dirname));
          const pathsForBlobsRev = versionFiles.map(path => path.relative(__dirname, path));



          console.log('versionFiles', versionFiles);
          console.log('pathsForBlobs', pathsForBlobs);
          console.log('pathsForBlobsRev', pathsForBlobsRev);

          console.log('versionFileBlobs', versionFileBlobs);

          const newTree = await createNewTree(
            octokit,
            versionFileBlobs,
            versionFiles,
            currentCommitTreeSha
          )

          const newCommit = await createNewCommit(
            octokit,
            commitMessage,
            newTree.sha,
            currentCommitSha
          )
          await setBranchToCommit(octokit, branch, newCommit.sha)

       }
    }

    const createBlobForFile = (octokit) => async (
        fileName
      ) => {
        const content = await fs.readFileSync(fileName).toString();


        const blobData = await octokit.git.createBlob({
          content,
          ...github.context.repo,
        })
        return blobData.data
      }

      const createNewTree = async (
        octokit,
        blobs,
        paths,
        parentTreeSha,
      ) => {
        const tree = blobs.map(({ sha }, index) => ({
          path: paths[index],
          mode: `100644`,
          type: `blob`,
          sha,
        }));
        const { data } = await octokit.rest.git.createTree({
          tree,
          base_tree: parentTreeSha,
          ...github.context.repo,
        })
        return data
      }

      const setBranchToCommit = (
        octokit,
        branch,
        newCommitSha
      ) =>
        octokit.rest.git.updateRef({
          ref: branch.replace('refs/', ''),
          sha: newCommitSha,
          ...github.context.repo
        })
  

    async function getUncomittedPackageVersionFiles() {
        // output returns a string, with each file name and status separated by linebreaks.
        const output = await getExecOutput('git', ['status', '--porcelain']);
      
        // Tranform string into an array
        let files = output.stdout.split(/\r?\n/);
        // Remove empty entry after final linebreak
        files = files.splice(0, files.length - 1);
      
        // only return files that were generated by "changeset version"
        // todo: ideally only from packages, not github actions
        const versionFileIdentifiers = /package.json|.changeset|CHANGELOG.md/;
        const uncomittedVersionFiles = files.filter((file) =>
          versionFileIdentifiers.test(file),
        );
      
        return uncomittedVersionFiles.map((file) => {
          // Initial Status format: XY PATH
          const fileDetails = file.replace(/^\s+/, '').split(/[ ]/);
          // Status codes: https://git-scm.com/docs/git-status
          const status = fileDetails[0];
          const name = fileDetails.pop();
          // Ignore deleted files
          return status === 'D' ? null : name;
        });
      }

    // async function create

main().catch((err) => core.setFailed(err.message));
