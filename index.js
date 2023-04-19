const core = require('@actions/core');
const github = require('@actions/github');

const validEvent = ['push', 'pull_request'];

function getBranchName(eventName, payload) {
    let branchName;
    switch (eventName) {
        case 'push':
            branchName = payload.ref.replace('refs/heads/', '');
            break;
        case 'pull_request':
            branchName = payload.pull_request.head.ref;
            break;
        default:
            throw new Error(`Invalid event name: ${eventName}`);
    }
    return branchName;
}

async function run() {
    try {
        const eventName = github.context.eventName;
        core.info(`Event name: ${eventName}`);
        if (validEvent.indexOf(eventName) < 0) {
            core.setFailed(`Invalid event: ${eventName}`);
            return;
        }

        const branch = getBranchName(eventName, github.context.payload);
        core.info(`Branch name: ${branch}`);
        
        // Check if branch is to be ignored
		// Split the ignore input by comma and trim each pattern
		const ignorePatterns = core.getInput('ignore').split(',').map((e) => e.trim());

		// Check if the branch matches any of the provided regex patterns in the ignorePatterns list
		const shouldIgnore = ignorePatterns.some((pattern) => {
		    // Create a RegExp object using the pattern
		    const regex = new RegExp(pattern);
		    // Test if the branch matches the regex pattern
		    return regex.test(branch);
		});

		// If the branch matches one of the ignored patterns, skip the checks and return
		if (shouldIgnore) {
		    core.info(`Skipping checks since ${branch} matches one of the ignored patterns - ${ignorePatterns}`);
		    return;
		}

        // Check if branch pass regex
        const regex = RegExp(core.getInput('regex'));
        core.info(`Regex: ${regex}`);
        if (!regex.test(branch)) {
            core.setFailed(`Branch ${branch} failed to pass match regex - ${regex}`);
            return
        }

        // Check if branch starts with a prefix
        const prefixes = core.getInput('allowed_prefixes');
        core.info(`Allowed Prefixes: ${prefixes}`);
        if (prefixes.length > 0 && !prefixes.split(',').some((el) => branch.startsWith(el))) {
            core.setFailed(`Branch ${branch} failed did not match any of the prefixes - ${prefixes}`);
            return
        }

        // Check min length
        const minLen = parseInt(core.getInput('min_length'));
        if (branch.length < minLen) {
            core.setFailed(`Branch ${branch} is smaller than min length specified - ${minLen}`);
            return
        }

        // Check max length
        const maxLen = parseInt(core.getInput('max_length'));
        if (maxLen > 0 && branch.length > maxLen) {
            core.setFailed(`Branch ${branch} is greater than max length specified - ${maxLen}`);
            return
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
