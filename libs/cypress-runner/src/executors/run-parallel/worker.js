const {parentPort} = require('worker_threads');
const {runExecutor} = require('@nrwl/devkit');

async function execute({targetDescription, overrides, context}) {
    console.log("Target Description: ", targetDescription);
    console.log("Overrides: ", overrides);
    // console.log("Context: ", context);

    for await (const output of await runExecutor(
        targetDescription,
        overrides,
        context
    )) {
        return output;
    }
}

// Listen for messages from the main thread
if (parentPort) {
    parentPort.on('message', async (data) => {
        const result = await execute(data);
        parentPort?.postMessage(result);
    });
}
