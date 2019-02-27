'use strict'

const
  { After, Before } = require('cucumber'),
  { Kuzzle, WebSocket } = require('kuzzle-sdk')

Before(function () {
  this.kuzzle = new Kuzzle(
    new WebSocket(this.host, { port: this.port })
  )

  return this.kuzzle.connect()
    .catch(e => console.log(e))
    .then(() => this.kuzzle.query({
      // Reset kuzzle database
      controller: 'admin',
      action: 'resetDatabase',
      refresh: 'wait_for'
    }))
    .then(() => {
      // reset computed field plugin configuration
      return this.kuzzle.query({
        controller: 'computed-fields/admin',
        action: 'reset'
      })
    })
})

After(function () {
  if (this.kuzzle && typeof this.kuzzle.disconnect === 'function') {
    this.kuzzle.disconnect();
  }
})
