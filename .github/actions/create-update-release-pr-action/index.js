const {getOctokitOptions, GitHub} = require('@actions/github/lib/utils');
const core = require('@actions/core');
const {exec, getExecOutput }= require('@actions/exec');
const github = require('@actions/github');
const fs = require("fs");
const {createPullRequest} = require('octokit-plugin-create-pull-request');

const main = async () => {
  const context = github.context;
  const token = core.getInput('GITHUB_TOKEN');

  const Octokit = GitHub.plugin(createPullRequest);

  const octokit = new Octokit(getOctokitOptions(token));

  const commitMessage = 'Version Packages';

    console.log('ℹ️ Checking for Version files');
    const versionFiles = await getUncomittedVersionFiles();

    if (versionFiles.length > 0) {
      console.log("✅ Version files found. Creating Version Package PR");


      const {data} = await octokit.createPullRequest({
        ...context.repo,
        title: commitMessage,
        body: getPRDescription(),
        head: `changeset-release/main`,
        update: true,
        createWhenEmpty: false,
        changes: [
          {
            commit: commitMessage,
            files: getFileContentForCommit(versionFiles),
            emptyCommit: false,
          },
        ],
      });

       await octokit.rest.issues.addLabels({
      ...context.repo,
      labels: ['Version Package'],
      issue_number: data.number,
    });



      console.log("✅  Succesfully created/updated PR #", data.number)
      return data.number;
    
    } else {
       console.log('⛔ No Version files found. Exiting without creating a Version Package PR.')
    }
  
};

async function getUncomittedVersionFiles(

) {
  // output returns a string, with each file name and status seperated by linebreaks.
  const output = await getExecOutput('git', ['status', '--porcelain']);
  
  // Tranform string into an array
  let files = output.stdout.split(/\r?\n/);
  // Remove empty entry after final linebreak
  files = files.splice(0, files.length -1); 

  // only return files that were generated by "changeset version"
  const versionFileIdentifiers = /package.json|.changeset|CHANGELOG.md/;
  return  files.filter((file) => versionFileIdentifiers.test(file))
}



function getFileContentForCommit(versionFiles) {
  const fileObj = versionFiles.reduce((obj, fileDetails) => {

    // Initial Status format: XY PATH
    const fileDetailsArray = fileDetails.replace(/^\s+/, "").split(/[ ]/);
    // Status codes: https://git-scm.com/docs/git-status
    const fileStatusCode = fileDetailsArray[0];
    const fileName = fileDetailsArray.pop();

    // If file was deleted, set content to an empty string
    // Otherwise, capture local file changes for commit
    return {
      ...obj,
      [fileName]: fileStatusCode === "D" ? "" : getFileContent(fileName)
    };
  }, {});

  return fileObj;
}

// function getPRDescription() {
//   const introContent = "This PR was opened by the [OSUI Version Package](https://github.com/shopify/online-store-ui/.github/actions/changesets/close-existing-release-pr-action/action.yml) GitHub action. When you're ready to do a release, you can merge this and the packages will be published to npm automatically. If you're not ready to do a release yet, that's fine, whenever you add more changesets to main, a fresh Version Package PR will be created.";
  
//   let files = versionFiles.split(/\r?\n/);
//   files = files.splice(0, files.length -1);
  
//   const changelogFiles = files.filter(file => file.includes("CHANGELOG.md"));

//   const changelogContent = getFileContent(changelogFiles)
  
//   // return `${introContent} ${changelogContent}`;
//   return introContent;
// }

function getFileContent(fileName){
  return fs.readFileSync(fileName).toString();
}

function getPRDescription() {
  // TODO: Iterate through each package + list changelog content per package
  // Example PR description: https://github.com/Shopify/polaris/pull/8612
  // return "This PR was opened by the [OSUI Version Package](https://github.com/shopify/online-store-ui/.github/actions/changesets/close-existing-release-pr-action/action.yml) GitHub action. When you're ready to do a release, you can merge this and the packages will be published to npm automatically. If you're not ready to do a release yet, that's fine, whenever you add more changesets to main, a fresh Version Package PR will be created.";
  return "Test whether this is also updated"
}


main().catch((err) => core.setFailed(err.message));