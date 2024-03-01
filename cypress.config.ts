// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {defineConfig} from 'cypress';
import {setupSharedNodeEvents} from "./cypress/commands/shared";
import {plugins} from "./cypress/commands/plugin";

export default defineConfig({
    fileServerFolder: '.',
    modifyObstructiveCode: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 30000,
    requestTimeout: 30000,
    viewportWidth: 1366,
    viewportHeight: 768,
    retries: {
        runMode: 2,
        openMode: 0,
    },
    numTestsKeptInMemory: 1,
    experimentalMemoryManagement: true,
    experimentalInteractiveRunEvents: true,
    env: {
        // Check docs about how to work with tags at: https://github.com/cypress-io/cypress/tree/develop/npm/grep
        grepOmitFiltered: true,
        FAIL_FAST_STRATEGY: 'run',
        FAIL_FAST_ENABLED: true,
        updateSnapshots: false,
        failOnSnapshotDiff: false,
    },
    e2e: {
        setupNodeEvents(on, config) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            const addCustomBrowserLaunchConfig = (
                browser: Cypress.Browser,
                launchOptions: Cypress.BrowserLaunchOptions
            ) => {
                /**
                 * We need to whitelist the baseUrl as a secure origin so that Auth0 works with
                 * custom local hostnames. More info:
                 * https://www.notion.so/capchase/Skipping-Auth0-consent-page-for-development-0f2258df88bb41f0a11bf6144c3468c7?pvs=4#df5e305972f34d9b82029c68bbf544a1
                 */
                if (browser.family === 'chromium' && browser.name !== 'electron') {
                    // auto open devtools
                    launchOptions.args.push(
                        `--unsafely-treat-insecure-origin-as-secure=${config.baseUrl}`
                    );
                }
                return launchOptions;
            };
            setupSharedNodeEvents(on, config, addCustomBrowserLaunchConfig);

            return plugins(on, config);
        },
        specPattern: './cypress/src/e2e/integration/**/*.spec.ts',
        supportFile: './cypress/support/index.ts',
    },
});
