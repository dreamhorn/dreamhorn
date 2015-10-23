// Generated by CoffeeScript 1.9.3
(function() {
  "use strict";
  var Events, When, _, eventSplitter, eventsApi, listenMethods, slice, triggerEvents,
    slice1 = [].slice;

  _ = require('./util');

  When = require('when');

  slice = Array.prototype.slice;

  Events = (function() {
    function Events() {}

    Events.prototype.on = function(name, callback, context) {
      var events;
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) {
        return this;
      }
      this._events || (this._events = {});
      events = this._events[name] || (this._events[name] = []);
      events.push({
        callback: callback,
        context: context,
        ctx: context || this
      });
      return this;
    };

    Events.prototype.once = function(name, callback, context) {
      var once, self;
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) {
        return this;
      }
      self = this;
      once = _.once(function() {
        self.off(name, once);
        return callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    };

    Events.prototype.off = function(name, callback, context) {
      var ev, events, i, j, len, len1, names, retain;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) {
        return this;
      }
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, len = names.length; i < len; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, len1 = events.length; j < len1; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) || (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) {
            delete this._events[name];
          }
        }
      }
      return this;
    };

    Events.prototype.will_trigger = function(name) {
      var allEvents, args, events, results;
      if (!this._events) {
        return When(void 0);
      }
      args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) {
        return this;
      }
      events = this._events[name];
      allEvents = this._events.all;
      results = [];
      if (events) {
        results.push(triggerEvents(events, args));
      }
      if (allEvents) {
        results.push(triggerEvents(allEvents, arguments));
      }
      return When.all(results)["catch"](function() {
        var args;
        args = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
        return console.error("Error in event " + name + ":", args);
      });
    };

    Events.prototype.stopListening = function(obj, name, callback) {
      var deleteListener, id, listeners;
      listeners = this._listeners;
      if (!listeners) {
        return this;
      }
      deleteListener = !name && !callback;
      if (typeof name === 'object') {
        callback = this;
      }
      if (obj) {
        (listeners = {})[obj._listenerId] = obj;
      }
      for (id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) {
          delete this._listeners[id];
        }
      }
      return this;
    };

    return Events;

  })();

  eventSplitter = /\s+/;

  eventsApi = function(obj, action, name, rest) {
    var i, j, key, len, len1, names;
    if (!name) {
      return true;
    }
    if (typeof name === 'object') {
      for (i = 0, len = name.length; i < len; i++) {
        key = name[i];
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }
    if (eventSplitter.test(name)) {
      names = name.split(eventSplitter);
      for (j = 0, len1 = names.length; j < len1; j++) {
        name = names[j];
        obj[action].apply(obj, [name].concat(rest));
      }
      return false;
    }
    return true;
  };

  triggerEvents = function(events, args) {
    var a1, a2, a3, ev;
    a1 = args[0];
    a2 = args[1];
    a3 = args[2];
    switch (args.length) {
      case 0:
        return When.all((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = events.length; i < len; i++) {
            ev = events[i];
            results1.push(ev.callback.call(ev.ctx));
          }
          return results1;
        })());
      case 1:
        return When.all((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = events.length; i < len; i++) {
            ev = events[i];
            results1.push(ev.callback.call(ev.ctx, a1));
          }
          return results1;
        })());
      case 2:
        return When.all((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = events.length; i < len; i++) {
            ev = events[i];
            results1.push(ev.callback.call(ev.ctx, a1, a2));
          }
          return results1;
        })());
      case 3:
        return When.all((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = events.length; i < len; i++) {
            ev = events[i];
            results1.push(ev.callback.call(ev.ctx, a1, a2, a3));
          }
          return results1;
        })());
      default:
        return When.all((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = events.length; i < len; i++) {
            ev = events[i];
            results1.push(ev.callback.apply(ev.ctx, args));
          }
          return results1;
        })());
    }
  };

  listenMethods = {
    listenTo: 'on',
    listenToOnce: 'once'
  };

  _.each(listenMethods, function(implementation, method) {
    return Events.prototype[method] = function(obj, name, callback) {
      var id, listeners;
      listeners = this._listeners || (this._listeners = {});
      id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') {
        callback = this;
      }
      obj[implementation](name, callback, this);
      return this;
    };
  });

  Events.eventSplitter = eventSplitter;

  module.exports = Events;

}).call(this);

//# sourceMappingURL=events.js.map
