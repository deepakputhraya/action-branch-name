const core = require('@actions/core');
const github = require('@actions/github');

async function validate() {
    // Check if event is valid
}

async function run() {
    try {
        const regex = core.getInput('regex');
        console.log(`Regex: ${regex}`);
        const allowedPrefixes = core.getInput('allowed_prefixes');
        console.log(`Allowed Prefixes: ${allowedPrefixes}`);

        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2);
        console.log(`The event payload: ${payload}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
