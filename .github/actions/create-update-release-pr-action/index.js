const {getOctokitOptions, GitHub} = require('@actions/github/lib/utils');
const core = require('@actions/core');
const {exec, getExecOutput }= require('@actions/exec');
const github = require('@actions/github');
const {createPullRequest} = require('octokit-plugin-create-pull-request');

const main = async () => {
  const context = github.context;
  const token = core.getInput('GITHUB_TOKEN');

  const Octokit = GitHub.plugin(createPullRequest);

  const octokit = new Octokit(getOctokitOptions(token));

  const commitMessage = 'Version Packages';

    console.log('Running git status check');
    const versionFiles = await hasGitStatusChanged();
    if (versionFiles.length > 0) {
      console.log("File changes detected.");

      console.log("files for commit:", getCommitFiles(versionFiles));


      const {data} = await octokit.createPullRequest({
        ...context.repo,
        title: commitMessage,
        body: getPRDescription(),
        head: `changesets-release/main`,
        update: true,
        createWhenEmpty: false,
        changes: [
          {
            commit: commitMessage,
            files: getCommitFiles(versionFiles),
            emptyCommit: false,
          },
        ],
      });

    //    await octokit.rest.issues.addLabels({
    //   ...context.repo,
    //   labels: 'Version Package',
    //   issue_number: data.number,
    // });



      console.log("Succesfully created/updated PR #", data)
      return data.number;
    
    } else {
       console.log('exiting....')
    }
    


  
};

async function hasGitStatusChanged(

) {
  const output = await getExecOutput('git', ['status', '--porcelain']);

  return output.stdout;
}

function getCommitFiles(versionFiles) {
  let files = versionFiles.split(/\r?\n/);
  files = files.splice(0, files.length -1);

  const sanitisedFiles = Array.from(files, (file) => {
    const fileArray = file.split(/[ ]/);
    return fileArray.pop();
  });

  const fileObj = sanitisedFiles.reduce((obj, fileName) => {

    return {
      ...obj,
      // [fileName]: "File content goes here"
      [fileName]: ({encoding, content}) => {
        // updates file based on current content
        return Buffer.from(content, encoding).toString('utf-8');
      },
    };
  }, {});

  return fileObj;
}

function getPRDescription() {
  // TODO: Iterate through each package + list changelog content per package
  // Example PR description: https://github.com/Shopify/polaris/pull/8612
  return "This PR was opened by the [OSUI Version Package](https://github.com/shopify/online-store-ui/.github/actions/changesets/close-existing-release-pr-action/action.yml) GitHub action. When you're ready to do a release, you can merge this and the packages will be published to npm automatically. If you're not ready to do a release yet, that's fine, whenever you add more changesets to main, a fresh Version Package PR will be created.";
}

main().catch((err) => core.setFailed(err.message));