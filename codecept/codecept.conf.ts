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
      waitForAction: 2000,
    },
  },
  include: {
    I: './steps_file',
  },
  plugins: {
    htmlReporter: {
      enabled: true,
    },
  },
  name: 'codecept',
};
