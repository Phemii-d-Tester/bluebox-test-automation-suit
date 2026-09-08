// Report run config — captures a screenshot for EVERY test (pass or fail) and
// emits a JSON result file the report generator consumes. Extends the base config.
const base = require('./playwright.config');

module.exports = {
  ...base,
  // One clean run per test so the report has one screenshot each.
  retries: 1,
  use: {
    ...base.use,
    screenshot: 'on',
    video: 'off',
    trace: 'off',
  },
  reporter: [['list'], ['json', { outputFile: 'report/results.json' }]],
};
