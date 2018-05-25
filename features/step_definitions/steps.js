'use strict';

const
  {
    Given,
    When,
    Then
  } = require('cucumber'),
  Kuzzle = require('kuzzle-sdk'),
  nexpect = require('nexpect'),
  {
    spawnSync
  } = require('child_process');

let
  kuzzle;

When(/I (create|update|delete) the document "([^"]*)"/, function (action, document, callback) {
  const collection = this.kuzzle.collection('test-collection', 'test-index');
  collection[`${action}DocumentPromise`].apply(collection, [document, { name: 'gordon', age: 42 }])
    .then(() => callback())
    .catch(error => callback(error));
});

Then(/my (pipe|hook) function is called with action "(\w+)" on document "([^"]*)"/, function (type, action, document, callback) {
  const expectedLog = `${type} action ${action} on document ${document}`;

  nexpect
    .spawn('docker-compose -f ./docker/docker-compose.yml logs kuzzle')
    .wait(expectedLog, () => callback())
    .run(error => {
      if (error) {
        return callback(error);
      }

      return callback(new Error(`"${expectedLog}" not found in logs`));
    });
});

When(/I request the route "([^"]*)"/, function (route, callback) {
  const url = `http://localhost:7512/_plugin/kuzzle-core-plugin-boilerplate${route}`;
  const curl = spawnSync('curl', [url]);

  if (curl.status === 0) {
    callback();
  } else {
    callback(new Error(`Can not reach Kuzzle: ${curl.stdout.toString()}`));
  }
});

Then(/the action "(\w+)" of the controller "(\w+)" with param "(\w+)" is called/, function (action, controller, param, callback) {
  const expectedLog = `controller ${controller} action ${action} param ${param}`;

  nexpect
    .spawn('docker-compose -f ./docker/docker-compose.yml logs kuzzle')
    .wait(expectedLog, () => callback())
    .run(error => {
      if (error) {
        return callback(error);
      }

      return callback(new Error(`"${expectedLog}" not found in logs`));
    });
});

When(/I create an user using my new "(\w+)" strategy/, function (strategy, callback) {
  const user = {
    content: {
      profileIds: ['admin']
    },
    credentials: {
      [strategy]: {
        username: 'hackerman',
        password: 'itshackingtime'
      }
    }
  };

  this.kuzzle
    .security
    .createUserPromise('hackerman', user, {})
    .then(() => callback())
    .catch(error => callback());
});

Then(/I can login my user using my new "(\w+)" strategy/, function (strategy, callback) {
  const credentials = {
    username: 'hackerman',
    password: 'itshackingtime'
  };

  this.kuzzle
    .loginPromise(strategy, credentials)
    .then(() => callback())
    .catch(error => callback(error));
});

Then('I disconnect Kuzzle client', function (callback) {
  this.kuzzle.disconnect();
  callback();
  // Cucumber never stop, if all tests pass we can safely exit the node process even if it is a little dirty :-*
  console.log('All scenarios are successfull');
  process.exit(0);
});
