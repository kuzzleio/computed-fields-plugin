'use strict'
var _ = require('lodash');

const 
  {Given, When, Then, And, Before} = require('cucumber'),
  {Kuzzle} = require('kuzzle-sdk')

Before(() => {
})

Given(/a running instance of Kuzzle/, function() {
  this.kuzzle = new Kuzzle('websocket', { host: this.host, port: this.port })
  return this.kuzzle.connect()
})

Given('an index {string}', function (indexName) {
  this.indexName = indexName
  return this.kuzzle
    .index
    .create(this.indexName)
});

Given('a collection {string} in {string}', function (collectionName, indexName) {
  this.collectionName = collectionName

  return this.kuzzle
    .collection
    .create(indexName, collectionName)
});

Given('I create a new computed field {string} as follow:', function (cfName, computedFieldCfg) {
  this.computedFields = {...this.computedFields, ...{[cfName]: JSON.parse(computedFieldCfg)}}
  return this.kuzzle.query(
    {
      controller: 'computed-fields/field',
      action: 'create',
      body: this.computedFields[cfName]
    });
})

When('I list the computed fields', function () {
  return this.kuzzle.query(
    {
      controller: 'computed-fields/field',
      action: 'list'
    })
    .then((r) => {
      this.result = r.result
    })
})

Then('the list contains computed field {string}', function (cfName) {
  let cf = this.result.find((e) => _.isMatch(e, this.computedFields[cfName]))
  if (typeof cf !== 'undefined') {
    return Promise.resolve()
  }
  return Promise.reject('Couldn\'t find configured computed field in \'list\' result:\n'+ JSON.stringify(this.result))
})

Then('computed field {string} has the following id: {string}', function (cfName, computedFieldID) {
  let cf = this.result.find((e) => _.isMatch(e, this.computedFields[cfName]))
  if(cf._id !== computedFieldID) {
    return Promise.reject(`Created computed id doesn't have the expected value: "${computedFieldID}"`)
  }
})

Given('I delete the computed field with id: {string}', function (computedFieldID) {
  return this.kuzzle.query(
    {
      controller: 'computed-fields/field',
      action: 'delete',
      _id: computedFieldID
    })
})

Then('the list doesn\'t contain computed field {string}', function (cfName) {
  const computedFieldCfg = this.result.find((e) => e._id === this.computedFields[cfName]._id)
  if (typeof computedFieldCfg === 'undefined') {
    return Promise.resolve()
  }
  return Promise.reject(`Computed field with _id = ${this.deletedComputedFieldID} wasn't properly deleted from plugin configuration`)
})

When('I create a computed field {string} with name = {string}, index = {string} and collection = {string}',
   function (cfName, name, index, collection) {
      let cfBody =  {name, index, collection, sourceFields: [], value: "A fake template"}
      return this.kuzzle.query(
        {
          controller: 'computed-fields/field',
          action: 'create',
          body: cfBody
        })
        .then((res)=> {
          this.computedFields = {...this.computedFields, ...{[cfName]: res.result._source}}
          this.computedFieldIDs = {...this.computedFieldIDs, ...{[cfName]: res.result._id}}
        })
});

Then('the computed field {string} has the following id: {string}', function (cfName, expectedID) {
  return this.computedFieldIDs[cfName] === expectedID
});


