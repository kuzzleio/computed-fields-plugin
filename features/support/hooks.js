'use strict'

const 
  { After, Before } = require('cucumber'), 
  { Kuzzle } = require('kuzzle-sdk')

Before(function () {
  this.kuzzle = new Kuzzle('websocket', {
    host: this.host,
    port: this.port
  })

  return this.kuzzle.connect()
    .catch(e => console.log(e))
    .then(() => this.kuzzle.query({
      // Reset kuzzle database
      controller: 'admin',
      action: 'resetDatabase',
      refresh: 'wait_for'
    }))
    .then(() => new Promise(resolve => setTimeout(resolve, 1000))) // To avoid a bug in admin controller where it would try to find aan index that already have been deleted
    .then(() => {
      // reset computed field plugin configuration
      return this.kuzzle.query({
        controller: 'computed-fields/computedFields',
        action: 'reset'
      })
    })
})

After(function () {
  if (this.kuzzle && typeof this.kuzzle.disconnect === 'function') {
    this.kuzzle.disconnect();
  }
})