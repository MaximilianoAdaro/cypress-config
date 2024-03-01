/* eslint-disable no-process-env */
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/* For some reason TS in the app-e2e configuration can't handle the serialization of BigInt.
 * See: https://github.com/GoogleChromeLabs/jsbi/issues/30 */
BigInt.prototype['toJSON'] = function () {
    return this.toString();
};

export function plugins(on, config) {
    config.baseUrl = process.env.BASE_URL;
    // To know if we are running the e2e tests against the local server
    config.env.IS_LOCAL = !!process.env.IS_LOCAL;
    return config;
}
