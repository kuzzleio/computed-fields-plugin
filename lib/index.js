var
  hooks = require('./config/hooks'),
  _context;

function KuzzleValidator () {}

KuzzleValidator.prototype.init = function (config, context) {
  this.config = config;
  _context = context;

  this.hooks = hooks;
};

KuzzleValidator.prototype.functionName = function (requestObject) {
  // Your code
};

module.exports = KuzzleValidator;