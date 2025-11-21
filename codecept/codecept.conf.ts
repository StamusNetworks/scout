import { setCommonPlugins, setHeadlessWhen } from '@codeceptjs/configure';
// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

export const config: CodeceptJS.MainConfig = {
  tests: './**/*.test.ts',
  output: './output',
  helpers: {
    Playwright: {
      browser: 'chromium',
      url: process.env.APP_URL || 'http://localhost:5173',
      show: true,
      waitForNavigation: 'load',
      waitForTimeout: 5000,
      keepBrowserState: !process.env.CI,
      keepCookies: !process.env.CI,
      trace: true,
      keepTraceForPassedTests: true,
    },
    REST: {
      endpoint: process.env.API_URL || 'http://localhost:3000',
    },
  },
  include: {
    I: './steps_file',
  },
  plugins: {
    htmlReporter: {
      enabled: true,
    },
    stepByStepReport: {
      enabled: true,
      deleteSuccessful: false,
    },
  },
  name: 'codecept',
};
