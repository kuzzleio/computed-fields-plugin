
function computeField(document, sourceFields, valueExpression) {
  let s = ''
  let value
  s += `value = \`${valueExpression}\``
  s = s.replace(/\${/gi, '${document.')
  eval(s)
  return value
}

class CorePlugin {
  /* eslint-disable no-unused-vars */
  /* eslint-disable no-console */

  constructor () {
    /**
     * Plugin context will be injected when "init" function is called as argument
     * You will probably want to save it in your plugin for later usage
     *
     * @type {PluginContext}
     */
    this.context = null;

    /**
     * Default plugin configuration
     * 
     * @type {Object}
     */
    this.config = { 
    };

    this.hooks = {
    };

    this.pipes = {
      'document:beforeCreate':    'calculateComputedFields',
      'document:beforeCreateOrReplace':    'calculateComputedFields',
      'document:beforeReplace':    'calculateComputedFields',
      'document:beforeUpdate':   'calculateComputedFields',
    };

    this.controllers = {
      'field': {
        'create': 'createComputedField',
        'delete': 'deleteComputedField',
        'list': 'listComputedFields',
        'recompute': 'recomputeComputedFields'
      }
    };

    this.routes = [
      {verb: 'get', url: '/', controller: 'field', action: 'list'},
      {verb: 'post', url: '/', controller: 'field', action: 'create'},
      {verb: 'post', url: '/delete/:id', controller: 'field', action: 'delete'}, // TODO: test using _id to avoid having to check where to find doc id when handling action
      {verb: 'post', url: '/:index/:collection/_recompute', controller: 'field', action: 'recompute'}
    ];
  }

  /**
   * Initializes the plugin with configuration and context.
   *
   * @param {Object} customConfig The custom configuration passed to the plugin
   *                               via the Kuzzle configuration overriding the defaultConfig.
   * @param {Object} context A restricted gateway to the Kuzzle API
   */
  init (customConfig, context) {
    // Here you can merge customConfig setted by kuzzle configuration with your default ones
    this.config = Object.assign(this.config, customConfig)

    // Here we store our context to be able to use it anywhere
    this.context = context
    this.storage = this.context.accessors.storage
    this.computedFields = []
    this.initStorage()
      .then(()=>{
        return this.loadComputedFields()
      })
      .catch(e => {
        this.context.log.error('==================== FAILED to init ==================\n', e)
      });
  }

  initStorage() {
    return this.storage.bootstrap({
      computedFields: {
        properties: {
          name: { type: 'keyword' },
          index: { type: 'keyword' },
          collection: { type: 'keyword' },
          sourceFields: [],
          value: { type: 'keyword' },
        }
      }
    })
    .then(r => {
      this.computedFieldsRepository = new this.context.constructors.Repository('computedFields')
    })
  }

  /**
   * Load the computed fields configuration from the plugin storage
   * 
   * @returns
   */
  loadComputedFields() {
    return this.computedFieldsRepository.search({})
      .then(r => {
        r.hits.forEach(e => delete e[Symbol.for('_kuzzle')])
        return r.hits
      })
      .then(computedFields => {
        this.computedFields = computedFields
      })
  }

  addComputedField(computedField) {
    return this.computedFieldsRepository.createOrReplace({
      _id: `${computedField.index}-${computedField.collection}-${computedField.name}`,
      name: computedField.name,
      index: computedField.index,
      collection: computedField.collection,
      sourceFields: [...computedField.sourceFields,],
      value: computedField.value,
    }, {refresh:  "wait_for"})
  }

  removeComputedField(id) {
    return this.computedFieldsRepository.delete(id, {refresh:  "wait_for"})
  }

  computeField(document, sourceFields, valueExpression) {
    return computeField(document, sourceFields, valueExpression)
  }

  /**
   * Check that all thes source fields needed to calculate 
   * given computed fields are present in the document
   * 
   * @param {Object} document: source document
   * @param {Object} cf: computed fields configuration
   * 
   * @returns {Promise}: resolves to true if all the fields needed to 
   *                     evaluate computed field are present in the document
   */
  checkForSourcesFields(document, cf) {
    for (let sourceField of cf.sourceFields) {
      const fields = sourceField.split('.')
      var cum = ''
      var obj = document
      for (let field of fields) {
        cum += cum ? '.' + field : field
        if (obj.hasOwnProperty(field)) {
          obj = obj[field]
        }
        else {
          return Promise.reject(new this.context.errors.NotFoundError(`No such '${cum}' field, needed to compute '${cf.name}'`))
        }
      }
    }
    return Promise.resolve(true)
  }
  /**
   * Get the list of needed field to compute the field
   * 
   * @param {String} template: The computed field template string: e.g. "${my_fields} is nicer than ${my.nested.field}!" 
   * 
   * @returns {Array}: Array of field names
   */
  getSourceFields(template) {
    let reg=/\$\{([\w_$][\w\d_$.]+)\}/g
    let sf = []
    let res
    while ((res = reg.exec(template))!== null) {
      sf.push(res[1])
    }
    return sf
  }
  

  /**
   * 
   * 
   * @param {Request} request The request that triggered the event
   * @param {Function} callback The callback that bears the result of the
   *                            function. Signature: `callback(error, request)`
   */
  calculateComputedFields (request, callback) {

    const {index, collection} = request.input.resource
    const cfs = this.getCollectionConputedFields(index, collection)

    const promises = []

    for(let cf of cfs) {
      if (collection === cf.collection && index === cf.index) {

        if (typeof request.input.body._computedFields === 'undefined') {
          request.input.body._computedFields = {}
        }

        promises.push(
          this.checkForSourcesFields(request.input.body, cf)
          .then(()=>{
            request.input.body._computedFields[cf.name] = this.computeField(request.input.body, cf.sourceFields, cf.value)
          })
          .catch(error => {  
            // If resquest action is an 'update', and a field is missing to calculate the computed field, 
            // We get the orignal document to get missing fields 

            if(request.input.action === 'update') {
              const getReq = new this.context.constructors.Request(request, {
                controller: 'document',
                action: 'get',
              })
              return this.context.accessors.execute(getReq)
                .then(res => {
                  const document = {...res.result._source, ...request.input.body}
                  return this.checkForSourcesFields(document, cf)
                    .then( () => {
                      request.input.body._computedFields[cf.name] = this.computeField(document, cf.sourceFields, cf.value)
                    })
                })
            }
            else {
              return Promise.reject(error)
            }
          })
        )
      }
    }

    return Promise.all(promises)
      .then(() => callback(null, request))
      .catch(e => {
        callback(e, request)
      })
  }

  /**
   * An example of controller function. It is called by the controller/action
   * routes defined in the `controllers` object above. It takes the request as
   * an argument and must return a Promise.
   *
   * @param {Request} request The request sent to the controller/action route
   *
   * @return {Promise} A promise resolving the response of the route.
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-controllers/
   * @see http://docs.kuzzle.io/guide/essentials/request-and-response-format/
   */
  createComputedField (request) {
    if (request.input.body 
      && request.input.body.name
      && request.input.body.index
      && request.input.body.collection
      && request.input.body.value
    ) {
      if(request.input.body.sourceFields) {
        return Promise.reject("The computed field shall not contain a 'sourceFields' field.")
      }
      request.input.body.sourceFields = this.getSourceFields(request.input.body.value)
      return this.addComputedField(request.input.body)
        .then(res => {
          return this.loadComputedFields().then(() => res) 
        })
    }
    return Promise.reject('Body must contain the following fields: \'name\', \'index\', \'collection\', \'sourceFields\' and \'value\'')
  }

  deleteComputedField (request) {
    let id = request.input.args.id || request.input.resource._id
    if (id) {
      return this.removeComputedField(id)
        .then(r => {
          return this.loadComputedFields() 
        })
    }
    return Promise.reject('Request must specify the \'id\' of the computed filed to delete')
  }

  listComputedFields (request) {
    return Promise.resolve(this.computedFields)
  }

  getCollectionConputedFields(index, collection) {
    return this.computedFields.filter(e => e.index === index && e.collection === collection)
  }

  /**
   * 
   * @param {Array} documents: An arry of documents to updates 
   * @param {String} index 
   * @param {String} collection 
   * @param {Object} cfs: computed fields to be applied
   * 
   * @returns {Promise}
   */
  recomputeFieldsForDocs(documents, index, collection, cfs) {
    var docUpdates = []
    documents.forEach(document => {
      var _id = document._id
      var body = document.body

      cfs.forEach(cf => {
        if (typeof body._computedFields === 'undefined') {
          body._computedFields = {}
        }
        body._computedFields[cf.name] = this.computeField(body, cf.sourceFields, cf.value)

        // TODO: push a bunch of docs with m* API

        const replaceDoc = new this.context.constructors.Request({
          index, 
          collection,
          controller: 'document',
          action: 'replace',
          _id,
          body
        })

        replaceDoc.context.user = { user: 'workaround'}
        docUpdates.push(this.context.accessors.execute(replaceDoc))
      })
    })
    return Promise.all(docUpdates)
  }

  /**
   * Get the next page of the search identified by the scroll id
   * 
   * @param {String} scrollId: the id of the scroll
   * @param {Number} remaining: the number of remaining document to be scrolled
   * @param {String} index: the index on witch we are updating document computed fields
   * @param {String} collection: the collection on witch we are updating document computed fields
   * 
   * @returns {Promise}
   */

  processNextScroll(scrollId, remaining, index, collection, cfs) {
    var scrollRequest = new this.context.constructors.Request({
      controller: 'document',
      action: 'scroll',
      scrollId,
      scroll: '1m'
    }) 

    return this.context.accessors.execute(scrollRequest)
      .then(res => {
        var p = []
        remaining -= res.result.hits.length

        p.push(this.recomputeFieldsForDocs(res.result.hits.map(e => {return {_id: e._id, body: e._source}}), index, collection, cfs))

        if (remaining > 0) {
          p.push(this.processNextScroll(res.result._scroll_id, remaining, index, collection, cfs))
        }
        return Promise.all(p)
      })
  }
  
  /**
   * Recompute all computed fields of a collection
   *  
   * @param {String} index : Index containing the collection of documents to be updates 
   * @param {String} collection : Collection containing the documents to be updates
   */
  recomputeCollectionComputedFields(request, index, collection) {
    const cfs = this.getCollectionConputedFields(index, collection)
    var searchRequest,
      scrollId,
      remaining,
      total

    if (cfs.length === 0) {
      throw new this.context.errors.NotFoundError(`No computed field configured for ${index}/${collection}`)
    }
    
    searchRequest = new this.context.constructors.Request(request, 
      {
        index, 
        collection,
        controller: 'document',
        action: 'search',
        body:{},
        scroll: '1m',
        from: 0,
        size: 2
      }
    )

    return this.context.accessors.execute(searchRequest)
      .then((res) => {
        var documents
        documents = res.result.hits.map(e => {return {_id: e._id, body: e._source}})
        scrollId = res.result._scroll_id
        total = res.result.total
        remaining = total - res.result.hits.length
        return this.recomputeFieldsForDocs(documents, index, collection, cfs)
      })
      .then((res) => {
        return this.processNextScroll(scrollId, remaining, index, collection, cfs)
      })
      .then((res) => {
        return Promise.resolve({updatedDocuments: total})
      })
  }
  
  /**
   * Recompute computed documents. This is used after the templates of value cahnged to
   * update computed fields of existings documents
   * 
   * Recalculate computed field for given index/collection
   * If one is null, then will recalculate all computed fields in all collections
   * 
   * @param {Object} request 
   */
  recomputeComputedFields(request) {
    // TODO: Fix return value on error...
    // recompute fields 
    const {index, collection} = request.input.resource
    return this.recomputeCollectionComputedFields(request, index, collection)
  }

}

module.exports = CorePlugin;
