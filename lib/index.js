
function CorePlugin () {
  this.context = null

  /**
   * Specifies a set of events along with the asynchronous
   * listener function they trigger.
   *
   * @type {Object}
   * @see http://docs.kuzzle.io/plugin-reference/#listener-plugins
   */
  this.hooks = {
    'document:beforeCreateOrReplace': 'asyncListener',
    'document:beforeReplace': 'asyncListener',
    'document:beforeUpdate': 'asyncListener',
  }

  /**
   * Specifies a set of events along with the synchronous
   * listener function they trigger.
   *
   * @type {Object}
   * @see  http://docs.kuzzle.io/plugin-reference/#pipe-plugins
   */
  this.pipes = {
    'document:beforeCreate': 'syncListener',
    'realtime:beforePublish': 'syncListener'
  }

  /**
   * Defines the new controller/action routes along with
   * the functions they call.
   *
   * @type {Object}
   * @see http://docs.kuzzle.io/plugin-reference/#controller-plugins
   */
  this.controllers = {
    'myNewController': {
      'myNewAction': 'doSomething'
    }
  }

  /**
   * Defines how to expose the new controller/action route
   * to the HTTP API.
   *
   * @type {Array}
   */
  this.routes = [
    {verb: 'get', url: '/do-something/', controller: 'myNewController', action: 'myNewAction'},
  ]

  /**
   * Initializes the plugin with configuration and context.
   * @param  {Object} config
   * @param  {Object} context A restricted gateway to the Kuzzle API (
   *                          http://docs.kuzzle.io/plugin-reference/#the-plugin-context)
   */
  this.init = function (config, context) {
    this.context = context
  }

  /*
   * An example of asynchronous listener function. It is triggered
   * by the `hooks` defined above and does not return anything. It is called
   * asynchronously and Kuzzle does not wait for it to return.
   *
   * @param {Request} The request that triggered the event (
   *                  http://docs.kuzzle.io/guide/#request-and-response-format)
   * @see http://docs.kuzzle.io/plugin-reference/#listener-plugins
  */
  this.asyncListener = function (request) {
    // Your code here, for example...
    console.log('operation on document: ' + request.resource._id)
  }

  /*
   * An example of synchronous listener function. It is triggered
   * by the `pipes` defined above. It is called synchronously and Kuzzle
   * reinjects the return value as the current request.
   *
   * @param {Request} request The request that triggered the event (
   *                          http://docs.kuzzle.io/guide/#request-and-response-format)
   * @param {Function} callback The callback that bears the result of the
   *                            function. Signature: `callback(error, request)`
   * @see http://docs.kuzzle.io/plugin-reference/#pipe-plugins
  */
  this.syncListener = function (request, callback) {
    // Your code here, for example...
    request.input.body.createdAt = Date.now()
    callback(null, request)
  }

  /**
   * An example of controller function. It is called by the controller/action
   * routes defined in the `controllers` object above. It takes the request as
   * an argument and must return a Promise.
   *
   * @param {Request} request The request sent to the controller/action route
   *                          (http://docs.kuzzle.io/plugin-reference/#how-plugins-receive-action-arguments)
   * @return {Promise} A promise resolving the response of the route.
   * @see http://docs.kuzzle.io/plugin-reference/#how-to-implement-a-controller-plugin
   */
  this.doSomething = function(request) {
    // Your code here, for example...
    return Promise.resolve('Hello world');
  }
}

module.exports = CorePlugin;
