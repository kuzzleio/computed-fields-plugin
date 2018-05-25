const
  {
    BeforeAll
  } = require('cucumber'),
  Kuzzle = require('kuzzle-sdk'),
  {
    spawnSync
  } = require('child_process');


BeforeAll(function(callback) {
  let maxTries = 10;
  let connected = false;
  let curl;

  while (! connected && maxTries > 0) {
    curl = spawnSync('curl', ['localhost:7512']);

    if (curl.status == 0) {
      connected = true;
    } else {
      console.log(`[${maxTries}] Waiting for kuzzle..`);
      maxTries -= 1;
      spawnSync('sleep', ['5']);
    }
  }

  if (! connected) {
    callback(new Error("Unable to start docker-compose stack"));
  }

  const kuzzle = new Kuzzle('localhost', (error, result) => {
    if (error) {
      callback(error);
    }

    kuzzle
      .createIndexPromise('test-index')
      .then(() => kuzzle.collection('test-collection', 'test-index').createPromise())
      .then(() => callback())
      .catch(err => callback(err))
      .finally(() => kuzzle.disconnect());
  })
});
