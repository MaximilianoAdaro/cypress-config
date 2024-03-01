// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cypressSplit from 'cypress-split';
// import cypressFailFast from 'cypress-fail-fast/plugin';
// eslint-disable-next-line no-restricted-imports
import datadogPlugin from 'dd-trace/ci/cypress/plugin';
import {handleBrowserLaunchConfig, removeAssetsIfNotFailedOrFlaky} from "./assets";

export const setupSharedNodeEvents = (
    on: any,
    config: any,
    addCustomBrowserLaunchConfig?: (browser: any, launchOptions: any) => any
) => {
    datadogPlugin(on, config);
    // cypressFailFast(on, config);
    cypressSplit(on, config);
    on('after:run', (results: CypressCommandLine.CypressRunResult) => {
        // console.log('CONSOLE: Cypress after run', results);
        console.log('CONSOLE: Cypress after:run');
        return Promise.allSettled([
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('dd-trace/ci/cypress/after-run')(results),
        ]);
    });
    on('after:spec', (_: Cypress.Spec, results: CypressCommandLine.RunResult) => {
        // console.log('CONSOLE: Cypress after spec', results);
        console.log('CONSOLE: Cypress after:spec');
        return Promise.allSettled([removeAssetsIfNotFailedOrFlaky(results)]);
    });
    on(
        'before:browser:launch',
        (browser: Cypress.Browser, launchOptions: Cypress.BrowserLaunchOptions) => {
            // Some configs need to set extra args to the browser
            if (addCustomBrowserLaunchConfig)
                launchOptions = addCustomBrowserLaunchConfig(browser, launchOptions);
            return handleBrowserLaunchConfig()(browser, launchOptions);
        }
    );
};
