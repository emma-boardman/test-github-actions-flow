let snapshots = '["@shopify/package@0.0.0-snapshot-release-20230413115708", "@shopify/package@0.0.0-snapshot-release-20230413115708"]';


// snapshots = snapshots.replace(/"([^"]*)"/g, '$1').replace("[", "").replace("]","").split(',');
snapshots = snapshots.replace(/^\[|\]$/g, '').replace(/"/g, '').split(', '); 
console.log(snapshots);


if (snapshots.length) {
    const snapshotMarkup =  snapshots.map(tag => (
        '```sh\n' +
        `yarn add ${tag}\n` +
        '```'
      )).join('\n');
    const multiple = snapshots.length > 1
    const body = (
    //   `🫰✨ **Thanks @${github.context.actor}! ` +
      `Your snapshot${multiple ? 's are' : ' is'} being published to [Cloudsmith](https://cloudsmith.io/~shopify/packages/?q=online-store-ui)\n\n` +
      `Test the snapshot${multiple ? 's' : ''} by updating your \`package.json\` ` +
      `with the newly published version${multiple ? 's' : ''}:\n` +
       `${snapshotMarkup}` + `\n\n` +
       `If you encounter any issues with your snapshots, look at the online-store-ui-snapshot-publish pipeline](link-when-it-exists) logs,` +
       `or reach out in [#online-store-ui](https://shopify.slack.com/archives/CJL1EMP88)\n`
    )
    console.log(body, body)
}

   
