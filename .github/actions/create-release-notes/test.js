const path = require('path');
const fs = require('fs');

tag = 'v7.0.0@mini-monorepo/package-number-one';

const [version, packageName] = tag.split('@');
const [_, packageDir] = packageName.split('/');

console.log(__dirname)

// get the package changelog
const changelogFileName = path.join(
  __dirname,
  '../../..',
  'packages', 
  packageDir, 
  'CHANGELOG.md',
);

console.log('changelog', changelogFileName);

const changelogContent = fs.readFileSync(changelogFileName).toString();

const index = `\n## ${version.replace(/^v/, '')}`;
  console.log('index', index);
  const newVersionIndex = changelogContent.indexOf(`\n## ${version.replace(/^v/, '')}`) + 1;

  console.log('newVersionIndex', )

  const lastVersionIndex =
    changelogContent.indexOf('\n## ', newVersionIndex + 1) - 1;
  const changelogEntry = changelogContent.substring(
    newVersionIndex,
    lastVersionIndex,
  );

  console.log('entry')