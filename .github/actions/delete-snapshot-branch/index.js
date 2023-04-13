const github = require('@actions/github');

const main = async () => {
    const token = core.getInput('GITHUB_TOKEN');
    const branchRef = core.getInput('BRANCH_REF');
    const octokit = github.getOctokit(token);

    try {
      await octokit.rest.git.deleteRef({
          ref: branchRef,
          ...github.context.repo,
      })
  } catch (error){
      core.setFailed(`Reference could not be deleted ${error}` )
  }

}

main().catch((err) => core.setFailed(err.message));