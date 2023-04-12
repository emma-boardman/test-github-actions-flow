
const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
  const token = core.getInput('GITHUB_TOKEN');
  const commentId = core.getInput('comment-id');
  const reaction = core.getInput('reaction');

  const octokit = github.getOctokit(token);

  await octokit.rest.reactions.createForIssueComment({
    comment_id: commentId,
    content: reaction,
    ...github.context.repo,
  });
};

main().catch((err) => core.setFailed(err.message));
