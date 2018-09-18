var reporter = require('cucumber-html-reporter');
const {Kuzzle} = require('kuzzle-sdk')

var options = {
  theme: 'bootstrap',
  jsonFile: 'report/cucumber-report.json',
  output: 'report/cucumber-report.html',
  reportSuiteAsScenarios: true,
  launchReport: true,
  metadata: {
  }
};

const kuzzle = new Kuzzle('websocket', {host:'localhost', port: 7512})
kuzzle.connect()
  .then(() => kuzzle.server.info())
  .then((info) => {
    options.metadata['Kuzzle Server'] = info.serverInfo.kuzzle.version
    options.metadata['Kuzzle Server node'] = info.serverInfo.kuzzle.nodeVersion
  })
  .then(()=>kuzzle.disconnect())
  .then(()=>reporter.generate(options))
  .catch((e)=>console.log('Failed to generate html repport: ', e))