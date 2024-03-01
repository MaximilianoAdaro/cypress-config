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
        runMode: 0,
        openMode: 0,
    },
    experimentalInteractiveRunEvents: true,
    env: {
        // Check docs about how to work with tags at: https://github.com/cypress-io/cypress/tree/develop/npm/grep
        grepOmitFiltered: true,
        FAIL_FAST_STRATEGY: "run",
        FAIL_FAST_ENABLED: true,
    },
    e2e: {
        setupNodeEvents(on, config) {
            setupSharedNodeEvents(on, config);
            return plugins(on, config);
        },
        specPattern: './cypress/src/e2e/integration/**/*.spec.ts',
        supportFile: './cypress/support/support.ts',
    },
});
