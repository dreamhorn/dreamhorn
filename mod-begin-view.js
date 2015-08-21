// Generated by CoffeeScript 1.9.3
(function() {
  "use strict";
  var BeginViewModule, Dreamhorn, ViewModule, assert, dom,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  assert = require('./assert');

  dom = require('./dom');

  Dreamhorn = require('./dreamhorn');

  ViewModule = require('./mod-view');

  BeginViewModule = (function(superClass) {
    extend(BeginViewModule, superClass);

    function BeginViewModule() {
      this.on_begin = bind(this.on_begin, this);
      return BeginViewModule.__super__.constructor.apply(this, arguments);
    }

    BeginViewModule.prototype.defaults = {
      begin_text: 'Begin!',
      template: '<a class="button button--primary begin-box__btn" id="begin-btn" href="#">{{ begin_text }}</a>'
    };

    BeginViewModule.prototype.events = {
      "click a#begin-btn": "on_begin"
    };

    BeginViewModule.prototype.setup = function() {
      return this.will_render().then((function(_this) {
        return function(html) {
          dom.wrap(_this.el).append(html);
          return _this.will_animate_in();
        };
      })(this));
    };

    BeginViewModule.prototype.teardown = function() {
      return dom.wrap(this.el).empty();
    };

    BeginViewModule.prototype.on_begin = function(evt) {
      return this.deck.broadcast('begin');
    };

    return BeginViewModule;

  })(ViewModule);

  module.exports = BeginViewModule;

}).call(this);

//# sourceMappingURL=mod-begin-view.js.map
