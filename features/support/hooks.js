const
  {
    BeforeAll
  } = require('cucumber'),
  Kuzzle = require('kuzzle-sdk'),
  {
    spawnSync
  } = require('child_process');

  const
    kuzzleHost = process.env.KUZZLE_HOST || 'localhost',
    kuzzlePort = process.env.KUZZLE_PORT || 7512;

BeforeAll(function(callback) {
  let maxTries = 10;
  let connected = false;
  let curl;

  while (! connected && maxTries > 0) {
    curl = spawnSync('curl', [`${kuzzleHost}:${kuzzlePort}`]);

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

  const kuzzle = new Kuzzle(kuzzleHost, { port: kuzzlePort }, (error, result) => {
    if (error) {
      callback(error);
    }

    // kuzzle
    //   .createIndexPromise('test-index')
    //   .then(() => kuzzle.collection('test-collection', 'test-index').createPromise())
    //   .then(() => callback())
    //   .catch(err => callback(err))
    //   .finally(() => kuzzle.disconnect());
    kuzzle
      .collection('test-collection', 'test-index')
      .truncatePromise()
      .then(() => callback())
      .catch(err => callback(err))
      .finally(() => kuzzle.disconnect());
  })
});
