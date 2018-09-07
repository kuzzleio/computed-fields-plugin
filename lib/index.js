function computeField(document, sourceFields, valueExpression) {
  var s = ""
  sourceFields.forEach(e => {
    s += `var ${e} = document['${e}']\n`
  })
  eval(s)
  var value = eval(valueExpression)
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
        'recompute': 'listComputedFields'
      }
    };

    this.routes = [
      {verb: 'get', url: '/', controller: 'field', action: 'list'},
      {verb: 'post', url: '/', controller: 'field', action: 'create'},
      {verb: 'post', url: '/delete/:id', controller: 'field', action: 'delete'}
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
   * Load the computed fileds configuration from the plugin storage
   * 
   * @ret
   */


  loadComputedFields() {
    return this.storage.bootstrap({
      computedFields: {
        properties: {
          name: { type: "keyword" },
          index: { type: "keyword" },
          collection: { type: "keyword" },
          sourceFields: [],
          value: { type: "keyword" },
        }
      }
    })
    .then(r => {
      this.computedFieldsRepository = new this.context.constructors.Repository('computedFields')
      return this.getComputedFields()
    })
    .then( computedFields => {
      console.log("ComputedFields: ", computedFields)
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
        .catch( e => reject(e))
      })
  }

  computeField(document, sourceFields, valueExpression) {
    return computeField(document, sourceFields, valueExpression)
  }

  /**
   * An example of synchronous listener function. It is triggered
   * by the `pipes` defined above. It is called synchronously and Kuzzle
   * reinjects the return value as the current request.
   *
   * The first parameter is a Request object accordingly to the documentation of registered events
   *
   * @param {Request} request The request that triggered the event
   * @param {Function} callback The callback that bears the result of the
   *                            function. Signature: `callback(error, request)`
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-pipes/
   * @see http://docs.kuzzle.io/guide/essentials/request-and-response-format/
  */
    updateComputedFields (request, callback) {
    this.computedFields.forEach( cf => {
      console.log("CF ID: ", cf._id)
      if( request.input.resource.collection === cf.collection && request.input.resource.index === cf.index) {
        console.log('Computing fields: ', cf)
        if( typeof request.input.body._computedFields === "undefined"){
          request.input.body._computedFields = {}
        }
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
    console.log(`createComputedField`);

    if (request.input.body 
      && request.input.body.name
      && request.input.body.sourceFields
      && request.input.body.index
      && request.input.body.collection
    ) {
      console.log("Body = ", request.input.body)
      return this.addComputedField(request.input.body)
        .then(r => {
          return this.loadComputedFields() 
        })
    }
    return Promise.reject("Body must contain the following fields: 'name', 'index', 'collection', 'sourceFields' and 'value'")
  }

  deleteComputedField (request) {
    console.log(request)
    if (request.input.args.id) {
      // TODO: add option to delete fields
      return this.removeComputedField(request.input.args.id)
        .then(r => {
          return  this.loadComputedFields() 
        })
    }
    return Promise.reject('Reques must specify the \'id\' of the computed filed to delete')
  }

  listComputedFields (request) {
    console.log(`listComputedFields`);
    return this.getComputedFields();
  }

  // TODO: Recompute existing documents...
  recomputeFields(request) {
    // TODO: implementation
  }

}

module.exports = CorePlugin;
