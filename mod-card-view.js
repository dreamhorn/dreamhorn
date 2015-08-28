// Generated by CoffeeScript 1.9.3
(function() {
  "use strict";
  var CardViewModule, Dreamhorn, ViewModule, When, _, assert, dom, templates,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  When = require('when');

  dom = require('./dom');

  assert = require('./assert');

  Dreamhorn = require('./dreamhorn');

  ViewModule = require('./mod-view');

  templates = require('./templates');

  CardViewModule = (function(superClass) {
    extend(CardViewModule, superClass);

    function CardViewModule() {
      this.on_choice_click = bind(this.on_choice_click, this);
      this.on_deactivate = bind(this.on_deactivate, this);
      return CardViewModule.__super__.constructor.apply(this, arguments);
    }

    CardViewModule.prototype.defaults = {
      template: '<div class="card card--{{ deck.name }} shadow--2dp" id="card-{{ deck.name }}-{{ card.id }}">\n  {{#if header}}\n  <div class="card__header card--{{ deck.name }}__header">\n    {{{ header }}}\n  </div>\n  {{/if}}\n  <div class="card__main card--{{ deck.name }}__main">\n    {{{ content }}}\n  </div>\n  {{#if choices}}\n  <ul class="card__choices card--{{ deck.name }}__choices">\n    {{#each choices}}\n    <li class="card__choices__choice">\n      <a data-target="{{ target }}" href="#">{{{ text }}}</a>\n    </li>\n    {{/each}}\n  </div>\n  {{/if}}\n</div>'
    };

    CardViewModule.prototype.events = {
      'click a': 'on_choice_click'
    };

    CardViewModule.prototype.get_context = function(ambient_context) {
      var card;
      card = this.options.card;
      _.extend(ambient_context, {
        card: card,
        deck: this.deck
      });
      return When.join(this.will_get_header(card, ambient_context), this.will_get_content(card, ambient_context), this.will_get_choices(card, ambient_context)).then((function(_this) {
        return function(arg) {
          var choices, content, header;
          header = arg[0], content = arg[1], choices = arg[2];
          return _.extend(ambient_context, {
            header: header,
            content: content,
            choices: choices
          });
        };
      })(this));
    };

    CardViewModule.prototype.will_get_header = function(card, context) {
      return When(card.header).then((function(_this) {
        return function(raw_header) {
          var header;
          header = templates.render_template(raw_header, context);
          return templates.convert_to_markdown(header);
        };
      })(this));
    };

    CardViewModule.prototype.will_get_content = function(card, context) {
      return When(card.content).then((function(_this) {
        return function(raw_content) {
          var content;
          content = templates.render_template(raw_content, context);
          return templates.convert_to_markdown(content);
        };
      })(this));
    };

    CardViewModule.prototype.will_get_choices = function(card, context) {
      return When(card.choices).then((function(_this) {
        return function(choices) {
          var choice, i, len;
          for (i = 0, len = choices.length; i < len; i++) {
            choice = choices[i];
            if (_.isUndefined(choice.text)) {
              choice.text = templates.render_template(choice.raw_text, context);
            }
          }
          return choices;
        };
      })(this));
    };

    CardViewModule.prototype.setup = function() {
      return this.deck.on('card:deactivate-all', this.on_deactivate);
    };

    CardViewModule.prototype.teardown = function() {
      dom.wrap(this.el).empty();
      return this.deck.off('card:deactivate-all', this.on_deactivate);
    };

    CardViewModule.prototype.on_deactivate = function() {};

    CardViewModule.prototype.on_choice_click = function(evt) {
      var card, choice, target;
      card = this.options.card;
      target = dom.wrap(evt.target).data('target');
      choice = card.choices_by_target[target];
      return card.will_choose(choice).then((function(_this) {
        return function(result) {
          if (_.isString(result)) {
            return dom.wrap(_this.el).replaceWith(templates.convert_to_markdown(result));
          }
        };
      })(this));
    };

    return CardViewModule;

  })(ViewModule);

  module.exports = CardViewModule;

}).call(this);

//# sourceMappingURL=mod-card-view.js.map
