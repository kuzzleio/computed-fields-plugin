var
  hooks = require('./config/hooks'),
  _context;

function KuzzlePlugin () {}

KuzzlePlugin.prototype.init = function (config, context) {
  this.config = config;
  _context = context;

  this.hooks = hooks;
};

KuzzlePlugin.prototype.functionName = function (request) {
  // Your code
};

module.exports = KuzzlePlugin;
