const
  { setWorldConstructor } = require('cucumber'),
  Kuzzle = require('kuzzle-sdk');

class KWorld {
  constructor() {
    this.kuzzle = new Kuzzle('localhost', (error, result) => {
      if (error) {
        throw error;
      }
    });

    this.username = 'alyx';
    this.password = 'vance';
  }
}

setWorldConstructor(KWorld);

module.exports = KWorld;
