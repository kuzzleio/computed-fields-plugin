'use strict'

const
  {BeforeAll, After} = require('cucumber'),

BeforeAll(function() {
})

After(function() {
  if (this.kuzzle && typeof this.kuzzle.disconnect === 'function') {
    this.kuzzle.disconnect();
  }
})
