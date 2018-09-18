var reporter = require('cucumber-html-reporter');

var options = {
  theme: 'bootstrap',
  jsonFile: 'report/cucumber-report.json',
  output: 'report/cucumber-report.html',
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