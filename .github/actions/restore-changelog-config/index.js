const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
  const token = core.getInput('GITHUB_TOKEN');
  const issue = core.getInput('ISSUE');
  const configPath = core.getInput('CONFIG_PATH');
  const configContent = core.getInput('CONFIG_CONTENT');

  const octokit = github.getOctokit(token);

  const lastCommitRef = await getCurrentBranchRefs(octokit, issue);

  await restoreConfigFile(octokit, lastCommitRef, configPath, configContent);
};

async function getCurrentBranchRefs(octokit, issue) {
  try {
    const {data} = await octokit.rest.pulls.get({
      pull_number: issue,
      ...github.context.repo,
    });

    console.log('data', data);

    return data.head.sha;
  } catch (error) {
    core.setFailed('Error retrieving current branch info:', error);
  }
}

async function restoreConfigFile(
  octokit,
  lastCommitRef,
  configPath,
  configContent,
) {
  console.log('args', lastCommitRef, configPath, configContent);
  try {
    const response = await octokit.rest.git.updateRef({
      ref: lastCommitRef,
      sha: null,
      force: true,
      files: [
        {
          path: configPath,
          mode: '100644',
          content: configContent,
        },
      ],
    });

    console.log('File restored successfully:', response);
  } catch (error) {
    console.error('Error restoring file:', error);
  }
}

main().catch((err) => core.setFailed(err.message));