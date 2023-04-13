async function deleteRef(octokit, ref, github){
    try {
        await octokit.rest.git.deleteRef({
            ref: ref,
            ...github.context.repo,
        })
    } catch (error){
        core.setFailed(`Reference could not be deleted ${error}` )
    }
}

exports.deleteRef = deleteRef;