const github = require('@actions/github');
const core = require('@actions/core');

const main = async () => {
    const token = core.getInput('GITHUB_TOKEN');
    const featureBranch = core.getInput('FEATURE_BRANCH');
    const snapshotBranchName = `snapshot-release/${featureBranch}`;
 
    const octokit = github.getOctokit(token);

  try {
    await octokit.rest.repos.getBranch({
      ...github.context.repo,
      branch: snapshotBranchName,
    });

    core.setOutput('HAS_SNAPSHOT_BRANCH', true);
    console.info("ℹ️ Snapshot branch found")

  } catch (error) {
    if (error.name === 'HttpError' && error.status === 404) {
      core.setOutput('HAS_SNAPSHOT_BRANCH', false);
    } else {
      throw Error(error);
    }
  }
}

main().catch((err) => core.setFailed(err.message));