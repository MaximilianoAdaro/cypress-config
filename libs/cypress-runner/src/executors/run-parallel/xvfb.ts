import Xvfb from '@cypress/xvfb';

const DEFAULT_DISPLAY_NUM = 99;

const xvfbOptions = {
  displayNum: DEFAULT_DISPLAY_NUM,
  reuse: true,
  timeout: 30_000, // milliseconds
  // Using more than 8-bit color depth prevents self-spawned Xvfb to crash on Chrome or Electron
  // https://docs.cypress.io/guides/continuous-integration/introduction#Xvfb
  xvfb_args: ['-screen', '0', '1280x1024x24'],
};

const xvfb = new Xvfb(xvfbOptions);

export default {
  start() {
    // This line will prevent Cypress from spawning an X server use an existing one
    // eslint-disable-next-line no-process-env
    process.env.DISPLAY = `:${DEFAULT_DISPLAY_NUM}`;

    return new Promise((resolve, reject) => {
      xvfb.start(function (err: Error, xvfbProcess: unknown) {
        if (err) return reject(err);
        return resolve(xvfbProcess);
      });
    });
  },

  stop() {
    return new Promise<void>((resolve, reject) => {
      xvfb.stop(function (err: Error) {
        if (err) return reject(err);
        return resolve();
      });
    });
  },
};
