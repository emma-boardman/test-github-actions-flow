const github = require('@actions/github');
const core = require('@actions/core');

const main = async () => {
    const token = core.getInput('GITHUB_TOKEN');
    const featureBranch = core.getInput('FEATURE_BRANCH');
    const snapshotBranchRef = `heads/snapshot-release/${featureBranch}`;
 
    const octokit = github.getOctokit(token);

    console.info("ℹ️ Deleting snapshot branch")

  try {
    await octokit.rest.git.deleteRef({
      ref: snapshotBranchRef,
      ...github.context.repo,
    });

  } catch (error) {
    throw Error("Error deleting snapshot branch", error)
  }
}

main().catch((err) => core.setFailed(err.message));