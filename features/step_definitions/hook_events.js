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

Given('a Kuzzle stack running', function (callback) {
  let maxTries = 12;
  let connected = false;
  let curl;

  while (! connected && maxTries > 0) {
    curl = spawnSync('curl', ['localhost:7512']);

    if (curl.status == 0) {
      connected = true;
    } else {
      console.log(`[${maxTries}] Waiting for kuzzle..`);
      maxTries -= 1;
      spawnSync('sleep', ['10']);
    }
  }

  if (! connected) {
    callback(new Error("Unable to start docker-compose stack"))
  }

  kuzzle = new Kuzzle('localhost', (error, result) => {
    if (error) {
      callback(error);
    }

    callback();
  })
});

When('Kuzzle trigger an hooked event', function (callback) {
  kuzzle
    .collection('test-collection', 'test-index')
    .createDocumentPromise('anti-citoyen-1', { name: 'gordon', age: 42 })
    .then(() => {
      return kuzzle
              .collection('test-collection', 'test-index')
              .updateDocumentPromise('anti-citoyen-1', { name: 'gordon freeman' })
              .then(() => callback());
    })
    .catch(error => callback(error));
});

Then('my hook function is called', function (callback) {
  let count = 0;

  nexpect
    .spawn('docker-compose -f ./docker/docker-compose.yml logs kuzzle')
    .wait('action create on document anti-citoyen-1', () => count++)
    .wait('action update on document anti-citoyen-1', () => count++)
    .run(error => {
      if (error) {
        return callback(error);
      }

      if (count != 2) {
        return callback(new Error("Error"));
      }

      return callback();
    });
});
