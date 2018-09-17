var reporter = require('cucumber-html-reporter');

var options = {
  theme: 'bootstrap',
  jsonFile: 'cucumber-report.json',
  output: 'cucumber-report.html',
  reportSuiteAsScenarios: true,
  launchReport: true,
  metadata: {
    'App Version': '1.0.0',
    'Test Environment': 'STAGING',
    'Kuzzle': '1.5.0',
    'Platform': 'Linux',
  }
};

reporter.generate(options);