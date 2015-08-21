// Generated by CoffeeScript 1.9.3
(function() {
  "use strict";
  var CardStackViewModule, CardView, Dreamhorn, ViewModule, When, _, assert, dom,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  dom = require('./dom');

  assert = require('./assert');

  Dreamhorn = require('./dreamhorn');

  ViewModule = require('./mod-view');

  CardView = require('./mod-card-view');

  When = require('when');

  CardStackViewModule = (function(superClass) {
    extend(CardStackViewModule, superClass);

    function CardStackViewModule() {
      this.pop = bind(this.pop, this);
      this.push = bind(this.push, this);
      this.on_reset = bind(this.on_reset, this);
      this.on_pop = bind(this.on_pop, this);
      this.on_replace = bind(this.on_replace, this);
      this.on_push = bind(this.on_push, this);
      return CardStackViewModule.__super__.constructor.apply(this, arguments);
    }

    CardStackViewModule.prototype.events = {};

    CardStackViewModule.prototype.setup = function() {
      this.deck.stack.on('pushed', this.on_push);
      this.deck.stack.on('popped', this.on_pop);
      this.deck.stack.on('replace', this.on_replace);
      this.deck.stack.on('clear', this.on_reset);
      return this.deck.on('reset', this.on_reset);
    };

    CardStackViewModule.prototype.on_push = function(card, data) {
      return this.push(card, data);
    };

    CardStackViewModule.prototype.on_replace = function(popped, pushed, data) {
      data.reactivate = false;
      this.pop(popped, data);
      return this.push(pushed, data);
    };

    CardStackViewModule.prototype.on_pop = function(card, data) {
      return this.pop(card, data);
    };

    CardStackViewModule.prototype.on_reset = function() {
      var cid, ref, situation;
      ref = this.situations;
      for (cid in ref) {
        situation = ref[cid];
        situation.remove();
      }
      return this.situations = {};
    };

    CardStackViewModule.prototype.push = function(card, data) {
      return this.deck.will_trigger('card:deactivate-all').then((function(_this) {
        return function() {
          return _this.will_start_card_view(card).then(function(card_view) {
            dom.wrap(_this.el).append(card_view.el);
            return card_view.will_animate_in();
          });
        };
      })(this));
    };

    CardStackViewModule.prototype.pop = function(card, data) {
      var reactivate, situation;
      if (!_.isUndefined(data)) {
        reactivate = _.isUndefined(data.reactivate) ? true : false;
      } else {
        reactivate = true;
      }
      situation = this.get_situation_from_card(card);
      this.run_before_exiting(situation);
      this.remove_situation(situation);
      this.run_after_exiting(situation);
      delete this.situations[card.cid];
      if (reactivate) {
        return this.reactivate_latest();
      }
    };

    CardStackViewModule.prototype.will_ensure_card_view = function(card, options) {
      var error;
      try {
        return When(this.get_subview(card.id));
      } catch (_error) {
        error = _error;
        options = _.defaultsDeep({
          card: card
        }, options);
        return this.will_use_subview({
          id: card.id,
          type: CardView,
          options: options
        });
      }
    };

    CardStackViewModule.prototype.will_start_card_view = function(card, options) {
      return this.will_ensure_card_view(card, options).then((function(_this) {
        return function(view) {
          return _this.will_start_subview(card.id);
        };
      })(this));
    };

    CardStackViewModule.prototype.will_stop_card_view = function(card) {
      return this.ensure_card_view(card).then((function(_this) {
        return function(view) {
          return _this.will_stop_subview(card.id);
        };
      })(this));
    };

    return CardStackViewModule;

  })(ViewModule);

  module.exports = CardStackViewModule;

}).call(this);

//# sourceMappingURL=mod-cardstack-view.js.map