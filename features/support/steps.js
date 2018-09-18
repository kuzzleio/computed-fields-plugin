'use strict'
var _ = require('lodash');

const 
  {Given, When, Then} = require('cucumber'),
  {Kuzzle} = require('kuzzle-sdk')

Given(/a running instance of Kuzzle/, function() {
  return Promise.resolve()
})

Given('an index {string}', function (indexName) {
  this.indexName = indexName
  return this.kuzzle
    .index
    .create(this.indexName, {refresh: "wait_for"})
});

Given('a collection {string} in {string}', function (collectionName, indexName) {
  this.collectionName = collectionName

  return this.kuzzle
    .collection
    .create(indexName, collectionName, {refresh: "wait_for"})
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
      let cfBody =  {name, index, collection, value: "A fake template"}
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

Given('I create the following new document with id {string} in index {string} and collection {string}:', function (id, index, collection, document) {
  return this.kuzzle.document.create(index, collection, id, JSON.parse(document))
})

When('I get the document with id {string} from index {string} and collection {string}', function (id, index, collection) {
  return this.kuzzle.document.get(index, collection, id)
  .then(r=>{
    this.documents = {...this.documents, [id]: r._source} 
  })
})

Then('the computed fields for document {string} contains:', function (id, cfValue) {
  if (!_.isMatch(this.documents[id]._computedFields, JSON.parse(cfValue))) {
    return Promise.reject(`The computed field doesn't match expected value: Got: ${JSON.stringify(this.documents[id]._computedFields)}`)
  }
})

Then('the computed fields for document {string} doesn\'t contain:', function (id, cfValue) {
  let cfKey = Object.keys(JSON.parse(cfValue))[0] // we expect cfValue from scenario to have only one key
  if (this.documents[id]._computedFields && Object.keys(this.documents[id]._computedFields).includes(cfKey)) {
    return Promise.reject(`The document computed fields is expected not to have the following field: ${cfKey}`)
  }
})

When('I replace the document with id {string} from index {string} and collection {string} with:', function (id, index, collection, document) {
  return this.kuzzle.document.replace(index, collection, id, JSON.parse(document))
})


Given('I update the document with id {string} in index {string} and collection {string} {string} with {string}', 
  function (id, index, collection, field, value) {
    return this.kuzzle.document.update(index, collection, id, { [field]: value})
})

Given('I update the document with id {string} in index {string} and collection {string}:', function (id, index, collection, update) {
  return this.kuzzle.document.update(index, collection, id, JSON.parse(update))
})

Given('I update the computed field {string} as follow:', function (cfName, computedFieldCfg) {
  this.computedFields = {...this.computedFields, ...{[cfName]: JSON.parse(computedFieldCfg)}}
  return this.kuzzle.query(
    {
      controller: 'computed-fields/field',
      action: 'create',
      body: this.computedFields[cfName]
    })
})


Given('I recompute computed fields for index {string} and collection {string}', function (index, collection) {
  return this.kuzzle.query(
    {
      controller: 'computed-fields/field',
      action: 'recompute',
      index,
      collection
    })
})

