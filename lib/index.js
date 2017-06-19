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
 * @class CorePlugin
 * @see http://docs.kuzzle.io/plugins-reference/plugins-creation-prerequisites/
 */
class CorePlugin {

  constructor () {
    this.config = {};
    this.context = null;

    /**
     * Specifies a set of events along with the asynchronous
     * listener function they trigger.
     *
     * The function "asyncListener" will be called whenever theses events are triggered.
     * - "document:beforeCreateOrReplace"
     * - "document:beforeReplace"
     * - "document:beforeUpdate"
     *
     * The function "asyncOverloadListener" will be called whenever the event is triggered.
     * - "core:overload"
     *
     * @type {Object}
     * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-hooks/
     * @see http://docs.kuzzle.io/kuzzle-events/
     */
    this.hooks = {
      'document:beforeCreateOrReplace': 'asyncListener',
      'document:beforeReplace': 'asyncListener',
      'document:beforeUpdate': 'asyncListener',
      'core:overload': 'asyncOverloadListener'
    };

    /**
     * Specifies a set of events along with the synchronous
     * listener function they trigger.
     *
     * The function "syncListener" will be called whenever the events are triggered.
     * - "document:beforeCreate"
     * - "realtime:beforePublish"
     *
     * Kuzzle will wait for the function's result before continuing the request process
     *
     * @type {Object}
     * @see  http://docs.kuzzle.io/plugins-reference/plugins-features/adding-pipes/
     * @see http://docs.kuzzle.io/kuzzle-events/
     */
    this.pipes = {
      'document:beforeCreate': 'syncListener',
      'realtime:beforePublish': 'syncListener'
    };

    /**
     * This exposed "controllers" property tells Kuzzle that it needs to extend
     * its API with new controllers and actions.
     *
     * These actions point to functions exposed to Kuzzle by the plugin.
     *
     * Any network protocol other than HTTP will be able to invoke this new
     * controller with the following JSON object:
     *
     * {
     *   controller: 'kuzzle-core-plugin-boilerplate/myNewController',
     *   action: 'myNewAction',
     *   ...
     * }
     *
     * @type {Object}
     * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-controllers/
     */
    this.controllers = {
      'myNewController': {
        'myNewAction': 'saySomething'
      }
    };

    /**
     * We also want to expose our new controller to the HTTP protocol.
     * To do so, we give Kuzzle instructions on how we want to expose our
     * controller to HTTP.
     * Any parameter starting with a ':' in the URL will be made dynamic by Kuzzle.
     *
     * The first route exposes the following GET URL:
     *  http://<kuzzle server>:<port>/_plugin/kuzzle-core-plugin-boilerplate/say-something/<dynamic value>
     *
     * Kuzzle will call the function 'doSomething' with a Request object,
     * containing the "name" property: request.input.args.property = '<dynamic value>'
     *
     * The second route exposes the following POST URL:
     *  http://<kuzzle server>:<port>/_plugin/kuzzle-core-plugin-boilerplate/say-something
     *
     * Kuzzle will provide the content body of the request in the Request object
     * passed to the function 'doSomething', in the request.input.body property
     *
     * @type {Array}
     * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-controllers/
     */
    this.routes = [
      {verb: 'get', url: '/say-something/:property', controller: 'myNewController', action: 'myNewAction'},
      {verb: 'post', url: '/say-something', controller: 'myNewController', action: 'myNewAction'}
    ];

    /**
     * Here we register a new "dummy" authentication strategy which can be used to
     * authenticate kuzzle users.
     *
     * @type {Array}
     * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
     * @see http://docs.kuzzle.io/guide/essentials/user-authentication/
     */
    this.strategies = {
      // "dummy" is the name of the strategy
      dummy: {
        config: {
          // The constructor of the Passport strategy you chose
          // You can also create your own Passport strategy (see: https://github.com/jaredhanson/passport-strategy/)
          constructor: require('passport-local').Strategy,

          // The options provided to the strategy constructor at instanciation
          strategyOptions: {},

          // The options provided to the authenticate function during the authentication process
          authenticateOptions: {
            scope: []
          },

          // The list of fields that may be provided in the credentials
          fields: ['login', 'password']
        },
        methods: {
          // The name of the create function
          afterRegister: 'afterRegister',
          // [mandatory] The name of the create function
          create: 'create',
          // [mandatory] The name of the delete function
          delete: 'delete',
          // [mandatory] The name of the exists function
          exists: 'exists',
          // The name of the getInfo function
          getById: 'getById',
          // The name of the getInfo function
          getInfo: 'getInfo',
          // [mandatory] The name of the update function
          update: 'update',
          // [mandatory] The name of the validate function
          validate: 'validate',
          // [mandatory] The name of the verify function
          verify: 'verify'
        }
      }
    };
  }

  /**
   * Initializes the plugin with configuration and context.
   *
   * @param {Object} customConfig The custom configuration passed to the plugin
   *                               via the Kuzzle configuration overriding the defaultConfig.
   * @param {Object} context A restricted gateway to the Kuzzle API
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-creation-prerequisites/#plugin-init-function
   * @see http://docs.kuzzle.io/plugins-reference/plugins-creation-prerequisites/#custom-plugin-configuration
   * @see http://docs.kuzzle.io/plugins-reference/plugins-context/
   */
  init (customConfig, context) {
    // Here is the good place to set default configuration values
    // which we can merge with custom configuration received by Kuzzle
    const defaultConfig = {
      configParam: 'defaultValue'
    };

    this.config = Object.assign(defaultConfig, customConfig);

    // Here we store our context to be able to use it anywhere
    this.context = context;
  }

  /**
   * An example of asynchronous listener function. It is triggered
   * by the `hooks` defined above and does not return anything. It is called
   * asynchronously and Kuzzle does not wait for it to return.
   *
   * The first parameter is a Request object accordingly to the documentation of registered events
   *
   * @param {Request} The request that triggered the event
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-hooks/
   * @see http://docs.kuzzle.io/guide/essentials/request-and-response-format/
  */
  asyncListener (request) {
    // Your code here, for example...
    console.log('operation on document: ' + request.resource._id);
  }

  /**
   * Another example of asynchronous listener function.
   *
   * Here, the first parameter is a Number accordingly to the documentation of registered events
   *
   * @param {Number} The overload percentage
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-hooks/
  */
  asyncOverloadListener (overload) {
    // Your code here, for example...
    console.log('Kuzzle is in overloaded state: ' + (overload * 100) + '%');
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
  syncListener (request, callback) {
    // Your code here, for example...
    request.input.body.createdAt = Date.now();

    callback(null, request);
  }

  /**
   * An example of controller function. It is called by the controller/action
   * routes defined in the `controllers` object above. It takes the request as
   * an argument and must return a Promise.
   *
   * @param {Request} request The request sent to the controller/action route
   * @return {Promise} A promise resolving the response of the route.
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-controllers/
   * @see http://docs.kuzzle.io/guide/essentials/request-and-response-format/
   */
  saySomething (request) {
    let property;

    if (request.input.body && request.input.body.property) {
      // Here we are checking for property sent in request body (eg: REST POST data)
      property = request.input.body.property;
    }
    else if (request.input.args.property) {
      // Here we are checking for dynamic property sent in request (eg: REST GET arguments)
      property = request.input.args.property;
    }
    else {
      property = 'world';
    }

    return Promise.resolve(`Hello ${property}!`);
  }

  /**
   * Part of authentication strategy
   *
   * Called after the strategy has been built with the constructor
   *
   * @param {*} constructedStrategy
   * @returns {Promise<object>}
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  afterRegister (constructedStrategy) {
    // do some action
    Promise.resolve(/* any value */);
  }

  /**
   * Part of authentication strategy
   *
   * Persists the provided credentials in some way
   * Must keep a link between the persisted credentials
   * and the kuid
   *
   * @param {KuzzleRequest} request
   * @param {object} credentials
   * @param {string} kuid
   * @returns {Promise<object>}
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  create (request, credentials, kuid) {
    // persist credentials
    Promise.resolve(/* non sensitive credentials info */);
  }

  /**
   * Part of authentication strategy
   *
   * Removes the user's stored credentials from
   * the plugin persistence layer
   *
   * @param {KuzzleRequest} request
   * @param {string} kuid
   * @returns {Promise<object>}
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  delete (request, kuid) {
    // remove credentials
    Promise.resolve(/* any value */);
  }

  /**
   * Part of authentication strategy
   *
   * Checks if user's credentials exist in the persistence layer
   *
   * @param {KuzzleRequest} request
   * @param {string} kuid
   * @returns {Promise<boolean>}
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  exists (request, kuid) {
    // check credentials existence
    Promise.resolve(/* true|false */);
  }

  /**
   * Part of authentication strategy
   *
   * Retrieves the non sensitive user's credentials information
   * from the persistence layer
   *
   * @param {KuzzleRequest} request
   * @param {string} kuid
   * @returns {Promise<object>}
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  getInfo (request, kuid) {
    // retrieve credentials
    Promise.resolve(/* non sensitive credentials info */);
  }

  /**
   * Part of authentication strategy
   *
   * Retrieves the non sensitive user's credentials information
   * from the persistence layer using the strategy internal id
   *
   * @param {KuzzleRequest} request
   * @param {string} id
   * @returns {Promise<object>}
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  getById (request, id) {
    // retrieve credentials
    Promise.resolve(/* non sensitive credentials info */);
  }

  /**
   * Part of authentication strategy
   *
   * Updates the user's credentials information in the
   * persistence layer
   *
   * @param {KuzzleRequest} request
   * @param {object} credentials
   * @param {string} kuid
   * @returns {Promise<object>}
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  update (request, credentials, kuid) {
    // update credentials
    Promise.resolve(/* non sensitive credentials info */);
  }

  /**
   * Part of authentication strategy
   *
   * Validates credentials validity conforming to the
   * authentication strategy rules (mandatory fields,
   * password length, username uniqueness, ...)
   *
   * @param {KuzzleRequest} request
   * @param {object} credentials
   * @param {string} kuid
   * @param {boolean} isUpdate
   * @returns {Promise<boolean>}
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  validate (request, credentials, kuid, isUpdate) {
    // validate credentials
    Promise.resolve(/* true|false */);
  }

  /**
   * Part of authentication strategy
   *
   * Provided to the Passport strategy as verify function
   * Should return the kuid if the user can authentify
   * or an object with the login failure reason as message attribute
   *
   * @param {KuzzleRequest} request
   * @param {*[]} args - provided arguments depends on the Passport strategy
   * @returns {Promise<string|{message: string}>}
   *
   * @see http://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  verify (request, username, password) {
    if (username === 'hackerman' && password === 'itshackingtime') {
      return Promise.resolve({
        kuid: username
      });
    }

    return Promise.resolve({
      kuid: null,
      message: 'Login failed - You shall not pass! Reason: ...'
    });
  }
}

module.exports = CorePlugin;
