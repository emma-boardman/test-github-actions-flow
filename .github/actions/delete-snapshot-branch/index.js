const github = require('@actions/github');

const main = async () => {
    const token = core.getInput('GITHUB_TOKEN');
    const featureBranch = core.getInput('FEATURE_BRANCH');
    const snapshotBranchName = `snapshot-release/${featureBranch}`;
    const snapshotBranchRef = `refs/heads/snapshot-release/${featureBranch}`;
 
    const octokit = github.getOctokit(token);


    console.log('branchref',featureBranch);
    console.log('snapshot', snapshotBranchName);
    console.log('snapshotrer', snapshotBranchRef);

   // Check if snapshot branch exists
  try {
    await octokit.rest.repos.getBranch({
      ...github.context.repo,
      branch: snapshotBranchName,
    });

    console.info("ℹ️ Snapshot branch found. Deleting...")

  } catch (error) {
    if (error.name === 'HttpError' && error.status === 404) {
        throw Error("No Snapshot branch found. Exiting without deletion.");
    } else {
      throw Error(error);
    }
  }

  try {
    // if branch exists, delete branch
    await octokit.rest.git.deleteRef({
      ref: snapshotBranchRef,
      ...github.context.repo,
    });

  } catch (error) {
    throw Error("Error deleting snapshot branch", error)
  }
}

main().catch((err) => core.setFailed(err.message));