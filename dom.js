// Generated by CoffeeScript 1.9.3
(function() {
  "use strict";
  var _, bean, bonzo, dom, qwery,
    slice = [].slice;

  _ = require('./util');

  bonzo = require('bonzo');

  qwery = require('qwery');

  bean = require('bean');

  bonzo.setQueryEngine(qwery);

  dom = function(selector, context) {
    return bonzo(qwery(selector, context));
  };

  _.extend(dom, {
    query: function(selector, context) {
      return qwery(selector, context);
    },
    wrap: function(el) {
      return bonzo(el);
    },
    make: function(html) {
      return bonzo.create(html);
    },
    on: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return bean.on.apply(bean, args);
    },
    one: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return bean.one.apply(bean, args);
    },
    off: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return bean.off.apply(bean, args);
    },
    clone: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return bean.clone.apply(bean, args);
    },
    fire: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return bean.fire.apply(bean, args);
    }
  });

  module.exports = dom;

}).call(this);

//# sourceMappingURL=dom.js.map
