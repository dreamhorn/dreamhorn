// Generated by CoffeeScript 1.9.3
(function() {
  "use strict";
  var Card, Deck, Decks, Dict, Dreamhorn, Effects, Events, Stack, When, _, assert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  _ = require('lodash');

  Dict = require('collections/dict');

  When = require('when');

  Stack = require('./stack');

  Card = require('./situation');

  Events = require('./events');

  Deck = require('./deck');

  Decks = require('./_decks');

  Effects = require('./_effects');

  assert = require('./assert');

  Dreamhorn = (function(superClass) {
    extend(Dreamhorn, superClass);

    function Dreamhorn(options) {
      options = options || {};
      this.options = _.defaultsDeep({}, options, Dreamhorn.defaults);
      this.decks = new Decks(this, this.options);
      this.decks.define(this.options.main_deck);
      this.effects = new Effects(this.options);
      this.modules = {};
      this.on('all', (function(_this) {
        return function() {
          var args, event, ref;
          event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          console.debug.apply(console, ["*" + event + "* event on Dreamhorn core:"].concat(slice.call(args)));
          return (ref = _this.decks).trigger.apply(ref, [event].concat(slice.call(args)));
        };
      })(this));
    }

    Dreamhorn.prototype.extend = function(extensions) {
      _.extend(this, extensions);
      return this;
    };

    Dreamhorn.prototype.use_module = function(arg) {
      var deck, deck_id, mod, module_id, module_type, options;
      module_id = arg.id, module_type = arg.type, deck_id = arg.deck, options = arg.options;
      deck = this.decks.get(deck_id || this.options.main_deck);
      options = _.defaultsDeep({}, options, this.options);
      mod = this.modules[module_id] = {
        id: module_id,
        instance: new module_type(deck, options),
        type: module_type,
        deck: deck_id,
        options: options,
        active: false
      };
      return this.trigger('module:used', mod).then((function(_this) {
        return function() {
          return mod.instance;
        };
      })(this));
    };

    Dreamhorn.prototype.get_module = function(module_id) {
      var mod;
      mod = this.modules[module_id];
      if (!mod) {
        throw new Error("No such module instance with id " + module_id + "!");
      }
      return mod;
    };

    Dreamhorn.prototype.start_module = function(module_id) {
      var mod;
      mod = this.get_module(module_id);
      if (!mod.active) {
        this.trigger('module:starting', mod);
        if (_.isFunction(mod.instance.start)) {
          mod.instance.start();
        }
        mod.active = true;
        return this.trigger('module:started', mod).then((function(_this) {
          return function() {
            return mod.instance;
          };
        })(this));
      } else {
        return When(mod.instance);
      }
    };

    Dreamhorn.prototype.stop_module = function(module_id) {
      var mod;
      mod = this.get_module(module_id);
      if (mod.active) {
        this.trigger('module:stopping', mod);
        if (_.isFunction(mod.instance.stop)) {
          mod.instance.stop();
        }
        mod.active = false;
        return this.trigger('module:stopped', mod).then((function(_this) {
          return function() {
            return mod.instance;
          };
        })(this));
      } else {
        return When(mod.instance);
      }
    };

    Dreamhorn.prototype.start_all_modules = function() {
      var module_id;
      for (module_id in this.modules) {
        return this.start_module(module_id);
      }
    };

    Dreamhorn.prototype.stop_all_modules = function() {
      var module_id;
      for (module_id in this.modules) {
        return this.stop_module(module_id);
      }
    };

    Dreamhorn.prototype.with_deck = function(deck_id, callback) {
      if (deck_id == null) {
        deck_id = 'main';
      }
      return callback(this.decks.get(deck_id));
    };

    return Dreamhorn;

  })(Events);

  Dreamhorn.extend = function(extensions) {
    return _.extend(Dreamhorn.prototype, extensions);
  };

  Dreamhorn.extend_defaults = function(extensions) {
    return _.extend(Dreamhorn.defaults, _.defaultsDeep({}, extensions, Dreamhorn.defaults));
  };

  Dreamhorn.defaults = {
    deck_type: Deck,
    main_deck: 'main'
  };

  module.exports = Dreamhorn;

}).call(this);

//# sourceMappingURL=dreamhorn.js.map
