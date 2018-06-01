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

let kuzzle, kuzzleHost, kuzzlePort;

Given(/a running instance of Kuzzle on "([^"]*)":"([^"]*)" with a client connected/, function (host, port, callback) {
  kuzzleHost = process.env.KUZZLE_HOST || host;
  kuzzlePort = process.env.KUZZLE_PORT || port;

  kuzzle = new Kuzzle(kuzzleHost, { port: kuzzlePort }, (error, result) => {
    callback(error);
  });
});

When(/I (create|update|delete) the document "([^"]*)"/, function (action, document, callback) {
  const collection = kuzzle.collection('test-collection', 'test-index');
  collection[`${action}DocumentPromise`].apply(collection, [document, { name: 'gordon', age: 42 }])
    .then(() => callback())
    .catch(error => callback(error));
});

Then(/I should encounter the log "([^"]*)"/, function (expectedLog, callback) {
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
  const url = `http://${kuzzleHost}:${kuzzlePort}/_plugin/kuzzle-core-plugin-boilerplate${route}`;
  const curl = spawnSync('curl', [url]);

  if (curl.status === 0) {
    callback();
  } else {
    callback(new Error(`Can not reach Kuzzle: ${curl.stdout.toString()}`));
  }
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

  kuzzle
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

  kuzzle
    .loginPromise(strategy, credentials)
    .then(() => callback())
    .catch(error => callback(error));
});

Then('I disconnect Kuzzle client', function () {
  kuzzle.disconnect();
});
