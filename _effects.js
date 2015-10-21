// Generated by CoffeeScript 1.9.3
(function() {
  "use strict";
  var Effects, When, _;

  _ = require('lodash');

  When = require('when');

  Effects = (function() {
    function Effects(options) {
      this.options = _.defaults({}, options);
      this._effects = {};
      this.define('default-in', function(el, options) {
        return require('./dom').wrap(el).show();
      });
      this.define('default-out', function(el, options) {
        return require('./dom').wrap(el).hide();
      });
    }

    Effects.prototype.define = function(name, runner) {
      return this._effects[name] = runner;
    };

    Effects.prototype.get = function(name) {
      var effect;
      effect = this._effects[name];
      if (!effect) {
        throw new Error("No such effect " + name + "!");
      }
      return effect;
    };

    Effects.prototype.run = function(name, el, options) {
      var error;
      options = _.defaults({}, options, this.options);
      try {
        return When["try"](this.get(name), el, options);
      } catch (_error) {
        error = _error;
        console.error(error);
        return When(false);
      }
    };

    return Effects;

  })();

  module.exports = Effects;

}).call(this);

//# sourceMappingURL=_effects.js.map
