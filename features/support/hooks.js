const
  {
    After,
    AfterAll,
    Before,
    BeforeAll
  } = require('cucumber'),
  Kuzzle = require('kuzzle-sdk');

BeforeAll(function(callback) {
  const kuzzle = new Kuzzle('localhost', (error, result) => {
    if (error) {
      callback(error);
    }

    kuzzle
      .collection('test-collection', 'test-index')
      .truncatePromise()
      .then(() => callback())
      .catch(err => callback(err))
  })
});
