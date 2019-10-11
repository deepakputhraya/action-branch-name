const core = require('@actions/core');
const github = require('@actions/github');

const validEvent = ['push', 'pull_request'];

function getBranchName(eventName, payload) {
    let branchName;
    switch (eventName) {
        case 'push':
            payload.refs.replace('refs/heads/', '');
            branchName = payload;
            break;
        case 'pull_request':
            branchName = payload.head.ref;
            break;
        default:
            throw new Error(`Invalid event name: ${eventName}`);
    }
    return branchName;
}

async function run() {
    try {
        const eventName = github.context.eventName;
        console.log(`The event name: ${eventName}`);
        if (validEvent.indexOf(eventName) < 0) {
            core.setFailed(`Invalid event: ${eventName}`);
            return;
        }
        // TODO: validate regex
        // TODO: validate prefixes

        const branch = getBranchName(eventName, github.context.payload);

        const regex = RegExp(core.getInput('regex'));
        console.log(`Regex: ${regex}`);
        if (!regex.test(branch)) {
            core.setFailed(`Branch ${branch} failed to pass match regex - ${regex}`);
            return
        }
        const prefixes = core.getInput('allowed_prefixes');
        console.log(`Allowed Prefixes: ${prefixes}`);

        if (prefixes.length > 0 && !prefixes.split(',').some((el) => branch.startsWith(el))) {
            core.setFailed(`Branch ${branch} failed did not match any of the prefixes - ${prefixes}`);
            return
        }
        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2);
        console.log(`The event payload: ${payload}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
