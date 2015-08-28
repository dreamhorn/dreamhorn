// Generated by CoffeeScript 1.9.3
(function() {
  "use strict";
  var Dreamhorn, ViewModule, When, _, dom, marked, templates;

  _ = require('lodash');

  marked = require('marked');

  dom = require('./dom');

  templates = require('./templates');

  When = require('when');

  Dreamhorn = require('./dreamhorn');

  ViewModule = (function() {
    ViewModule.prototype.events = {};

    ViewModule.prototype.defaults = {
      template: '',
      effect_in: 'default-in',
      effect_out: 'default-out'
    };

    function ViewModule(deck, options) {
      this.deck = deck;
      this.options = _.defaults({}, options, this.defaults, this.constructor.__super__.defaults);
      this.template = this.options.template ? templates.compile_template(this.options.template) : function() {
        return '';
      };
      _.bindAll(this);
      this.selector = this.options.selector;
      this.el = this.options.el;
      this.subviews = {};
    }

    ViewModule.prototype.get_context = function(ambient_context) {
      return ambient_context;
    };

    ViewModule.prototype.will_get_ambient_context = function() {
      var ambient;
      ambient = {};
      return this.deck.will_trigger('context:get', ambient).then(function() {
        return ambient;
      });
    };

    ViewModule.prototype.will_get_context = function(overrides) {
      return this.will_get_ambient_context().then((function(_this) {
        return function(ambient_context) {
          var local_context;
          local_context = _this.get_context(ambient_context);
          return When(local_context).then(function(local) {
            return _.defaults({}, overrides, local, _this.options);
          });
        };
      })(this));
    };

    ViewModule.prototype.will_render = function(overrides) {
      return this.will_get_context(overrides).then((function(_this) {
        return function(context) {
          return templates.render_template(_this.template, context);
        };
      })(this));
    };

    ViewModule.prototype.connect_events = function() {
      var event, event_selector, handler, handler_name, ref, ref1, selector;
      ref = this.events;
      for (event_selector in ref) {
        handler_name = ref[event_selector];
        ref1 = event_selector.split(/\s+/, 2), event = ref1[0], selector = ref1[1];
        handler = this[handler_name];
        if (_.isFunction(handler)) {
          dom.on(this.el, event, selector, handler);
        }
      }
    };

    ViewModule.prototype.disconnect_events = function() {
      var event, event_selector, handler, handler_name, ref, ref1, selector;
      ref = this.events;
      for (event_selector in ref) {
        handler_name = ref[event_selector];
        ref1 = event_selector.split(/\s+/, 2), event = ref1[0], selector = ref1[1];
        handler = this[handler_name];
        if (_.isFunction(handler)) {
          dom.off(this.el, event, handler);
        }
      }
    };

    ViewModule.prototype.setup = function() {};

    ViewModule.prototype.will_animate_in = function() {
      return When(this.el).then((function(_this) {
        return function(el) {
          return _this.deck.base.effects.run(_this.options.effect_in, el, _this.options, _this);
        };
      })(this));
    };

    ViewModule.prototype.teardown = function() {};

    ViewModule.prototype.will_animate_out = function() {
      return When(this.el).then((function(_this) {
        return function(el) {
          return _this.deck.base.effects.run(_this.options.effect_out, el, _this.options, _this);
        };
      })(this));
    };

    ViewModule.prototype.start = function() {
      if (this.selector && !this.el) {
        this.el = dom.query(this.selector)[0];
      } else if (!this.selector && !this.el) {
        this.el = this.will_render().then((function(_this) {
          return function(html) {
            return _this.el = dom.make(html)[0];
          };
        })(this));
      }
      return When.join(this.el, this.setup()).then(this.connect_events);
    };

    ViewModule.prototype.stop = function() {
      return When["try"](this.disconnect_events).then(this.teardown).then((function(_this) {
        return function() {
          return _this.el = null;
        };
      })(this));
    };

    ViewModule.prototype.will_use_subview = function(arg) {
      var mod, options, subview_id, subview_type;
      subview_id = arg.id, subview_type = arg.type, options = arg.options;
      mod = this.subviews[subview_id] = {
        id: subview_id,
        instance: new subview_type(this.deck, options),
        type: subview_type,
        deck: this.deck,
        options: options,
        active: false
      };
      return this.deck.will_trigger('subview:used', mod).then((function(_this) {
        return function() {
          return mod.instance;
        };
      })(this));
    };

    ViewModule.prototype.get_subview = function(subview_id) {
      return this.subviews[subview_id];
    };

    ViewModule.prototype.will_start_subview = function(subview_id) {
      var mod, promises;
      promises = [];
      mod = this.get_subview(subview_id);
      if (!mod) {
        throw new Error("No such subview " + subview_id);
      }
      if (!mod.active) {
        promises.push(this.deck.will_trigger('subview:starting', mod));
        if (_.isFunction(mod.instance.start)) {
          promises.push(mod.instance.start());
        }
        mod.active = true;
        promises.push(this.deck.will_trigger('subview:started', mod).then(function() {
          return mod.instance;
        }));
      } else {
        promises.push(When(mod.instance));
      }
      return When.all(promises).then(function() {
        return mod.instance;
      });
    };

    ViewModule.prototype.will_stop_subview = function(subview_id) {
      var mod, promises;
      promises = [];
      mod = this.get_subview(subview_id);
      if (!mod) {
        throw new Error("No such subview " + subview_id);
      }
      if (mod.active) {
        promises.push(this.deck.will_trigger('subview:stopping', mod));
        if (_.isFunction(mod.instancpe.stop)) {
          promises.push(mod.instance.stop());
        }
        mod.active = false;
        promises.push(this.deck.will_trigger('subview:stopped', mod).then(function() {
          return mod.instance;
        }));
      } else {
        promises.push(When(mod.instance));
      }
      return When.all(promises);
    };

    return ViewModule;

  })();

  module.exports = ViewModule;

}).call(this);

//# sourceMappingURL=mod-view.js.map
