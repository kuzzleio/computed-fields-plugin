function computeField(document, sourceFields, valueExpression) {
  var s = ''
  var value
  sourceFields.forEach(e => {
    s += `var ${e} = document['${e}']\n`
  })
  eval(s)
  value = eval(valueExpression)
  return value
}

/**
 * Plugins must be valid NodeJS require-able modules, usually shipped as a directory containing either:
 *  - an `index.js` file in its root directory,
 *    exporting a valid Javascript class exposing an `init` method, or
 *  - a well-formed `package.json` file in its root directory,
 *    specifying the path of the main require-able in the `main` field.
 *
 * To determine the Plugin name, Kuzzle looks for the `name` field
 * in the `package.json` file falling back to the plugin directory name otherwise.
 *
 * @see http://docs.kuzzle.io/plugins-reference/plugins-creation-prerequisites/
 */
class CorePlugin {
  /* eslint-disable no-unused-vars */
  /* eslint-disable no-console */

  /**
   * Create a new instance of CorePlugin
   *
   * Workflow is:
   *  - Kuzzle loads plugins in <kuzzle install dir>/plugins/enabled/* and try to instanciate them, also configuration and manifest.json file are read.
   *     /!\ Misconfiguration will stop starting sequance of kuzzle
   *  - Plugin manager registers all plugin features into kuzzle (register hooks/pipes, load custom configuration, check for authentication strategies, ...)
   *     /!\ Misconfiguration will stop starting sequance of kuzzle
   *
   */
  constructor () {
    /**
     * Plugin context will be injected when "init" function is called as argument
     * You will probably want to save it in your plugin for later usage
     *
     * @type {PluginContext}
     */
    this.context = null;

    /**
     * Here is the good place to set default configuration values
     * which you can merge with overrided configuration received by Kuzzle during plugin initialization
     *
     * @type {Object}
     */
    this.config = { 
    };

    this.hooks = {
    };

    this.pipes = {
      'document:beforeCreate':    'updateComputedFields',
      'document:beforeUpdate':    'updateComputedFields',
      'document:beforeCreateOrReplace':    'updateComputedFields',
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
      {verb: 'post', url: '/delete/:id', controller: 'field', action: 'delete'},
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
    this.config = Object.assign(this.config, customConfig);

    // Here we store our context to be able to use it anywhere
    this.context = context;
    this.storage = this.context.accessors.storage
    this.computedFields = []
    this.loadComputedFields()
      .catch(e => {
        console.log('==================== FAILED to init ==================\n', e)
      });

  }

  /**
   * Load the computed fields configuration from the plugin storage
   * 
   * @ret
   */
  loadComputedFields() {
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
    }).then(r => {
      this.computedFieldsRepository = new this.context.constructors.Repository('computedFields')
      return this.getComputedFields()
    }).then(computedFields => {
      // console.log('ComputedFields: ', computedFields)
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
    })
  }

  removeComputedField(id) {
    return this.computedFieldsRepository.delete(id)
  }

  getComputedFields() {
    return new Promise((resolve, reject) => {
      this.computedFieldsRepository.search({})
        .then(r => {
          r.hits.forEach(e => delete e[Symbol.for('_kuzzle')])
          resolve(r.hits)
        })
    })
  }

  computeField(document, sourceFields, valueExpression) {
    return computeField(document, sourceFields, valueExpression)
  }

  checkForSourcesFields() {
    // TODO: 
  }

  /**
   * 
   * 
   * @param {Request} request The request that triggered the event
   * @param {Function} callback The callback that bears the result of the
   *                            function. Signature: `callback(error, request)`
   */
  updateComputedFields (request, callback) {

    const {index, collection} = request.input.resource
    const cfs = this.getCollectionConputedFields(index, collection)

    cfs.forEach(cf => {
      if (collection === cf.collection && index === cf.index) {

        if (typeof request.input.body._computedFields === 'undefined') {
          request.input.body._computedFields = {}
        }

        // TODO: check source fields are in the body 
        // checkForSourcesFields(request.input.body)

        request.input.body._computedFields[cf.name] = this.computeField(request.input.body, cf.sourceFields, cf.value)
      }
    })

    callback(null, request);
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
    // console.log('createComputedField');

    if (request.input.body 
      && request.input.body.name
      && request.input.body.sourceFields
      && request.input.body.index
      && request.input.body.collection
    ) {
      // console.log('Body = ', request.input.body)
      return this.addComputedField(request.input.body)
        .then(r => {
          return this.loadComputedFields() 
        })
    }
    return Promise.reject('Body must contain the following fields: \'name\', \'index\', \'collection\', \'sourceFields\' and \'value\'')
  }

  deleteComputedField (request) {
    // console.log(request)
    if (request.input.args.id) {
      // TODO: add option to delete fields
      return this.removeComputedField(request.input.args.id)
        .then(r => {
          return this.loadComputedFields() 
        })
    }
    return Promise.reject('Reques must specify the \'id\' of the computed filed to delete')
  }

  listComputedFields (request) {
    return this.getComputedFields();
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

      // console.log('Document to update: ', document)
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
        // console.log('Replace document request: ', replaceDoc)
        docUpdates.push(this.context.accessors.execute(replaceDoc)
          .then(r => {
            // console.log('Document updated...')
            return r
          })
          .catch(e => {
            // console.log('===> ERROR : ', e)
            return Promise.reject(e)
          })
        )
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

    // console.log('====>  scrollRequest = ', scrollRequest)

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
      remaining


    if (cfs.length === 0) {
      return Promise.resolve()
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
        // console.log('-Search result: ', res.result)
        documents = res.result.hits.map(e => {return {_id: e._id, body: e._source}})
        scrollId = res.result._scroll_id
        remaining = res.result.total - res.result.hits.length
        return this.recomputeFieldsForDocs(documents, index, collection, cfs)
      })
      .then((res) => {
        return this.processNextScroll(scrollId, remaining, index, collection, cfs)
      })
  }
  
  /**
   * Recompute computed documents. This is used after the templates of value cahnged to
   * update computed fields of existings documents
   * 
   * @param {Object} request 
   */
  recomputeComputedFields(request) {
    // recompute fields 
    console.log('Recompute computed fields: ', request.input.resource)
    return this.recomputeCollectionComputedFields(
      request,
      request.input.resource.index, 
      request.input.resource.collection
    )
  }

}

module.exports = CorePlugin;
