import {CypressExecutorSchema, RunParallelExecutorSchema} from './schema';
import {ExecutorContext, logger, parseTargetString, readTargetOptions,} from '@nrwl/devkit';
import {cpus} from 'os';
import {Worker} from 'worker_threads';
import xvfb from './xvfb';
import {parseShardString} from "./utils";
import {getSpecFiles, getWeightedSpecsChunks} from "./specs";

const CONFIG_OVERRIDE = {
    watch: false,
};

function runExecutorInWorker(
    targetDescription: {
        project: string;
        target: string;
        configuration?: string | undefined;
    },
    overrides: {
        [k: string]: unknown;
    },
    context: ExecutorContext
): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`${__dirname}/worker.js`);

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });

        worker.postMessage({targetDescription, overrides, context});
    });
}

interface GetSpecsChunksOptions {
    threads?: number;
    specPattern: string;
    ignorePattern?: string;
    projectRootPath: string;
    numShards?: number;
    shardIndex?: number;
}

export async function getSpecsChunks({
                                         threads,
                                         specPattern,
                                         ignorePattern,
                                         projectRootPath,
                                         numShards = 1,
                                         shardIndex = 0,
                                     }: GetSpecsChunksOptions) {
    const specFiles = await getSpecFiles({
        specPattern,
        cwd: projectRootPath,
        ignorePattern,
    });

    const maxThreads = threads || cpus().length - 1;

    // Prevent the number of runners being higher than the total number of files
    const numRunners = Math.min(maxThreads, specFiles.length);

    // Await first to let be able to catch the error
    return await getWeightedSpecsChunks({
        specFiles,
        numChunks: numRunners,
        numShards,
        shardIndex,
    });
}

export default async function runParallel(
    {
        threads,
        runTarget,
        specPattern,
        failFast,
        ignorePattern,
        shard = '1/1',
        ...restOptions
    }: RunParallelExecutorSchema,
    context: ExecutorContext
) {
    console.log('Starting run-parallel executor...');
    console.table({
        threads,
        runTarget,
        specPattern,
        failFast,
        ignorePattern,
        shard,
        ...restOptions,
    });
    const {shardIndex, numShards} = parseShardString(shard);

    if (shardIndex >= numShards || shardIndex < 0)
        throw Error('Illegal shard index');

    const {project, target, configuration} = parseTargetString(runTarget);

    console.log("{project, target, configuration}");
    console.table({project, target, configuration});

    const specsChunks = await getSpecsChunks({
        specPattern,
        ignorePattern,
        threads,
        numShards,
        shardIndex,
        projectRootPath: `${context.cwd}/${context.workspace.projects[project].root}`,
    });

    console.log("specsChunks");
    console.log(specsChunks);

    console.log("process.env.CI: ", process.env.CI);

    /**
     * Start single instance of Xvfb server to avoid having problems when running multiple instances
     * More info: https://docs.cypress.io/guides/continuous-integration/introduction#Xvfb
     */
    // process.env.CI is set by GH in the CI.
    // mac does not have xvfb so we need to skip this
    // eslint-disable-next-line no-process-env
    if (process.env.CI) await xvfb.start();

    // Remove 'headless' option because is deprecated and will show a warning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {headless, ...targetOptions} =
        readTargetOptions<CypressExecutorSchema>(
            {project, target, configuration},
            context
        );

    try {
        const results = await Promise.all(
            specsChunks.map(async (chunk) => {
                // Due to sharding, there are chunks that can be empty
                if (!chunk.length) return {success: true};

                const {success} = await runExecutorInWorker(
                    {project, target, configuration},
                    {
                        ...targetOptions,
                        ...restOptions,
                        ...CONFIG_OVERRIDE,
                        spec: chunk.join(','),
                        env: {
                            UPDATE_WEIGHTS_FILE: false,
                        },
                    },
                    context
                );

                /**
                 * If a worker finishes early with 'success: false' and 'failFast'
                 * is enabled, throw an error for Promise.all to exit early
                 */
                if (!success && failFast)
                    throw Error("[FAIL FAST] - A thread finished with 'failed' status");

                return {success};
            })
        );

        const isFailure = results.some(({success}) => !success);

        return {
            success: !isFailure,
        };
    } catch (err) {
        // Getting to this point means that failFast was enabled or an unexpected error occurred
        logger.error(err);
        return {success: false};
    } finally {
        // Log the error but don't make the process fail
        await xvfb.stop().catch(logger.warn);
    }
}
