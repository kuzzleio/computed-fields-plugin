'use strict'

const
  {BeforeAll, After} = require('cucumber'),
  {Kuzzle} = require('kuzzle-sdk'),
  KuzzleWorld = require('./world'),
  {spawnSync} = require('child_process');

BeforeAll(() => {
  let maxTries = 10;
  let connected = false;
  let curl;
  console.log('>>>>> BeforeALL <<<<<<')

  console.log('this = ', this)

  const world = new KuzzleWorld();

  while (! connected && maxTries > 0) {
    curl = spawnSync('curl', [`${world.host}:${world.port}`]);

    if (curl.status === 0) {
      connected = true;
    } else {
      console.log(`[${maxTries}] Waiting for kuzzle..`);
      maxTries -= 1;
      spawnSync('sleep', ['5']);
    }
  }

  if (! connected) {
    return Promise.reject(new Error('Unable to start docker-compose stack'))
  }

  const kuzzle = new Kuzzle('websocket', {host: world.host, port: world.port})
  return kuzzle.connect()
    .then(() => kuzzle.disconnect())
})


After(function() {
  if (this.kuzzle) {
    return this.kuzzle.query({
      controller: 'admin',
      action: 'resetDatabase'  
    })
    .then(()=>{
      if (this.kuzzle && typeof this.kuzzle.disconnect === 'function') {
        this.kuzzle.disconnect();
      }
    })
  }
})
