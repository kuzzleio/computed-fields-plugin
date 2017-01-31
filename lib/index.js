// Used to show how to extend the authentication strategies,
// you probably want to change or drop this.
// See also http://docs.kuzzle.io/plugin-reference/#authentication-plugin
const LocalStrategy = require('passport-local').Strategy

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
   * This new controller can be invoked with any protocol other than HTTP using
   * the following JSON object:
   *
   * {
   *   'controller': '<plugin name>/myNewController'
   *   'action: 'myNewAction'
   *   // ... and any other necessary parameters
   * }
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
   * This controller's action will be exposed to HTTP requests using the
   * following URL:
   *
   * GET http://<server>:<port>/_plugin/<plugin name>/do-something
   *
   * @type {Array}
   */
  this.routes = [
    {verb: 'get', url: '/do-something/', controller: 'myNewController', action: 'myNewAction'},
  ]

  /**
   * Initializes the plugin with configuration and context.
   * @param  {Object} customConfig The custom configuration passed to the plugin
   *                               via the Kuzzle configuration (
   *                               http://docs.kuzzle.io/guide/#configuring-kuzzle)
   *                               overriding the defaultConfig.
   * @param  {Object} context A restricted gateway to the Kuzzle API (
   *                          http://docs.kuzzle.io/plugin-reference/#the-plugin-context)
   */
  this.init = function (customConfig, context) {
    const defaultConfig = {
      configParam: 'defaultValue'
    }
    this.config = Object.assign(defaultConfig, customConfig)
    this.context = context

    // Registers the new local strategy (currently commented as this would
    // break the default local auth strategy in Kuzzle). See also
    // http://docs.kuzzle.io/plugin-reference/#register-the-strategy-to-kuzzle
    //
    // this.context.accessors.passport.use(new LocalStrategy(this.verify.bind(this)))
  }

  /**
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

  /**
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
    return Promise.resolve('Hello world!');
  }

  /**
   * The function used to authenticate a user. This is a dummy example just to
   * show how to use the `done` callback. The `done` callback must be provided
   * as the last argument of the `verify` function. Its signature is
   * `done(error, userObject)`, where `error` must of type `Error` and
   * `userObject` represents the successfully authenticated user.
   * The number and type of arguments may vary depending on the strategy used.
   *
   * @param  {string}   username
   * @param  {string}   password
   * @param  {Function} done     The callback to call when done
   * @see http://docs.kuzzle.io/plugin-reference/#authentication-plugin-example-using-the-localstrategy-strategy
   */
  this.verify = function(username, password, done) {
    if (username === 'hackerman' && password === 'itshackingtime')  {
      // This is just an example, not really likely to work if you don't
      // have a user called 'hackerman' in your system.
      done(null, this.context.accessors.users.load(username))
      return
    }

    done(new this.context.errors.ForbiddenError('Too much time hacked!'))
  }
}

module.exports = CorePlugin;
