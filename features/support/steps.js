'use strict'
var _ = require('lodash');

const {
  Given,
  When,
  Then
} = require('cucumber')

Given(/a running instance of Kuzzle/, function () {
  return Promise.resolve()
})

Given('an index {string}', function (indexName) {
  this.indexName = indexName
  return this.kuzzle
    .index
    .create(this.indexName, {
      refresh: 'wait_for'
    })
    .then(r => this.attach(JSON.stringify(r, undefined, 2)))

});

Given('a collection {string} in {string}', function (collectionName, indexName) {
  this.collectionName = collectionName

  return this.kuzzle
    .collection
    .create(indexName, collectionName, {
      refresh: 'wait_for'
    })
    .then(r => this.attach(JSON.stringify(r, undefined, 2)))
});

Given('I create a new computed field in index {string} and collection {string} as follow:',
  function (index, collection, computedFieldCfg) {
    computedFieldCfg = JSON.parse(computedFieldCfg)
    let cfName = computedFieldCfg.name
    this.computedFields = { ...this.computedFields,
      ...{
        [cfName]: computedFieldCfg
      }
    }
    return this.kuzzle.query({
      controller: 'computed-fields/computedFields',
      action: 'create',
      index,
      collection,
      body: computedFieldCfg
    })
    .then(r => this.attach(JSON.stringify(r, undefined, 2)))
  }
)

When('I list the computed fields of index {string} and collection {string}', function (index, collection) {

  return this.kuzzle.query({
    controller: 'computed-fields/computedFields',
    action: 'list',
    index,
    collection
  })
  .then((r) => {
    this.result = r.result
    this.attach(JSON.stringify(r, undefined, 2))
  })
})

Then('the list contains computed field', function (computedField) {
  let cf = this.result.find((e) => _.isMatch(e, JSON.parse(computedField)))
  if (typeof cf !== 'undefined') {
    return Promise.resolve()
  }
  return Promise.reject('Couldn\'t find configured computed field in \'list\' result:\n' + JSON.stringify(this.result))
})

Then('computed field {string} has the following id: {string}', function (cfName, computedFieldID) {
  let cf = this.result.find((e) => _.isMatch(e, this.computedFields[cfName]))
  if (cf._id !== computedFieldID) {
    return Promise.reject(`Created computed id doesn't have the expected value: "${computedFieldID}"`)
  }
})

Then('the list doesn\'t contain computed field', function (computedField) {
  const computedFieldCfg = this.result.find((e) => _.isMatch(e, JSON.parse(computedField)))
  if (typeof computedFieldCfg === 'undefined') {
    return Promise.resolve()
  }
  return Promise.reject(`Computed field with _id = ${this.deletedComputedFieldID} wasn't properly deleted from plugin configuration`)
})

Then('the list doesn\'t contain computed field named {string}', function (cfName) {
  const computedFieldCfg = this.result.find((e) => e.name === cfName)
  if (typeof computedFieldCfg === 'undefined') {
    return Promise.resolve()
  }
  return Promise.reject(`Computed field with _id = ${this.deletedComputedFieldID} wasn't properly deleted from plugin configuration`)
})

When('I create a computed field {string} with name = {string}, index = {string} and collection = {string}',
  function (cfName, name, index, collection) {
    let cfBody = {
      name,
      index,
      collection,
      value: 'A fake template'
    }
    return this.kuzzle.query({
      controller: 'computed-fields/computedFields',
      action: 'create',
      body: cfBody
    })
    .then((res) => {
      this.computedFields = { ...this.computedFields,
        ...{
          [cfName]: res.result._source
        }
      }
      this.computedFieldIDs = { ...this.computedFieldIDs,
        ...{
          [cfName]: res.result._id
        }
      }
      this.attach(JSON.stringify(res, undefined, 2))
    })
  }
)

Then('the computed field {string} has the following id: {string}', function (cfName, expectedID) {
  return this.computedFieldIDs[cfName] === expectedID
});

Given('I create the following new document with id {string} in index {string} and collection {string}:', function (id, index, collection, document) {
  return this.kuzzle.document.create(index, collection, id, JSON.parse(document), {
    refresh: 'wait_for'
  })
  .then(r => this.attach(JSON.stringify(r, undefined, 2)))
})

When('I get the document with id {string} from index {string} and collection {string}', function (id, index, collection) {
  return this.kuzzle.index.refresh(index)
    .then(() => this.kuzzle.document.get(index, collection, id))
    .then(r => {
      this.attach(JSON.stringify(r, undefined, 2))
      this.documents = { ...this.documents,
        [id]: r._source
      }
    })
})

Then('the computed fields for document {string} contains:', function (id, cfValue) {
  if (!_.isMatch(this.documents[id]._computedFields, JSON.parse(cfValue))) {
    this.attach(JSON.stringify(this.documents[id], undefined, 2))
    return Promise.reject(`The computed field doesn't match expected value: Got: ${JSON.stringify(this.documents[id]._computedFields)}`)
  }
})

Then('the computed fields for document {string} doesn\'t contain {string}', function (id, cfName) {
  if (this.documents[id]._computedFields && Object.keys(this.documents[id]._computedFields).includes(cfName)) {
    this.attach(JSON.stringify(this.documents[id], undefined, 2))
    return Promise.reject(`The document computed fields is expected not to have the following field: ${cfName}`)
  }
})

Then('the computed fields for document {string} doesn\'t contain:', function (id, cfValue) {
  if (this.documents[id]._computedFields && Object.keys(this.documents[id]._computedFields).includes(cfValue.name)) {
    this.attach(JSON.stringify(this.documents[id], undefined, 2))
    return Promise.reject(`The document computed fields is expected not to have the following field: ${cfValue.name}`)
  }
})

When('I replace the document with id {string} from index {string} and collection {string} with:', function (id, index, collection, document) {
  return this.kuzzle.document.replace(index, collection, id, JSON.parse(document))
})


Given('I update the document with id {string} in index {string} and collection {string} {string} with {string}',
  function (id, index, collection, field, value) {
    return this.kuzzle.document.update(index, collection, id, {
      [field]: value
    })
  }
)

Given('I update the document with id {string} in index {string} and collection {string}:', function (id, index, collection, update) {
  return this.kuzzle.document.update(index, collection, id, JSON.parse(update))
})

Given('I update the computed field {string} as follow:', function (cfName, computedFieldCfg) {
  this.computedFields = { ...this.computedFields,
    ...{
      [cfName]: JSON.parse(computedFieldCfg)
    }
  }
  return this.kuzzle.query({
      controller: 'computed-fields/computedFields',
      action: 'create',
      body: this.computedFields[cfName]
    })
    .then(r => this.attach(JSON.stringify(r, undefined, 2)))
})


Given('I recompute computed fields for index {string} and collection {string}', function (index, collection) {
  return this.kuzzle.query({
    controller: 'computed-fields/computedFields',
    action: 'recompute',
    index,
    collection
  })
})

Given('I delete the computed field with name {string} from index {string} and collection {string}', function (name, index, collection) {
  return this.kuzzle.query({
    controller: 'computed-fields/computedFields',
    action: 'delete',
    body: {
      name
    },
    index, 
    collection
  })
})