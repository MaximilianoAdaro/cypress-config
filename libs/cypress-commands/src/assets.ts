/* eslint-disable no-console */
import {unlink} from 'fs';
import {promisify} from 'util';

export const removeAssetsIfNotFailedOrFlaky = async (
    results: CypressCommandLine.RunResult
) => {
    /**
     * Sometimes screenshots would be generated even if none of the tests
     * haven't failed. This function aims to remove all static assets if a
     * suite hasn't failed at all to save resources and prevent confusion
     */
    if (
        results &&
        (results.video || !!results.screenshots?.length) &&
        !!results.tests?.length
    ) {
        // Do we have failures for any retry attempts?
        const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed')
        );

        if (!failures) {
            const unlinkPromise = promisify(unlink);

            // Filter screenshots not ending with "snap.png" or "diff.png"
            const deletableScreenshots = results.screenshots?.filter(
                (screenshot) =>
                    !screenshot.path.endsWith('snap.png') &&
                    !screenshot.path.endsWith('diff.png')
            );

            // delete the video if the spec passed and no tests retried
            await Promise.all([
                ...(results.video ? [unlinkPromise(results.video)] : []),
                ...(deletableScreenshots?.map((screenshot) =>
                    unlinkPromise(screenshot.path)
                ) || []),
            ]);
        }
    }
};
