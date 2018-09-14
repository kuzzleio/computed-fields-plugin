const { setWorldConstructor } = require('cucumber');

class KuzzleWorld {
  constructor () {
    this.host = process.env.KUZZLE_HOST || 'localhost'
    this.port = process.env.KUZZLE_PORT || '7512'
  }
}

setWorldConstructor(KuzzleWorld);

module.exports = KuzzleWorld