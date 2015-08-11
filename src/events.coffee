"use strict"
_ = require('lodash')
When = require('when')

slice = Array.prototype.slice


class Events
  # Bind an event to a `callback` function. Passing `"all"` will bind
  # the callback to all events fired.
  on: (name, callback, context) ->
    if not eventsApi(this, 'on', name, [callback, context]) or not callback
       return this
    this._events or (this._events = {})
    events = this._events[name] or (this._events[name] = [])
    events.push({callback: callback, context: context, ctx: context or this})
    return this

  # Bind an event to only be triggered a single time. After the first time
  # the callback is invoked, it will be removed.
  once: (name, callback, context) ->
    if not eventsApi(this, 'once', name, [callback, context]) or not callback
      return this
    self = this
    once = _.once(() ->
      self.off(name, once)
      callback.apply(this, arguments)
    )
    once._callback = callback
    return this.on(name, once, context)

  # Remove one or many callbacks. If `context` is null, removes all
  # callbacks with that function. If `callback` is null, removes all
  # callbacks for the event. If `name` is null, removes all bound
  # callbacks for all events.
  off: (name, callback, context) ->
    if not this._events or not eventsApi(this, 'off', name, [callback, context])
      return this

    if not name and not callback and not context
      this._events = {}
      return this

    names = if name then [name] else _.keys(this._events)

    for name in names
      if events = this._events[name]
        this._events[name] = retain = []
        if callback or context
          for ev in events
            if ((callback and callback isnt ev.callback and callback isnt ev.callback._callback) or
                (context and context isnt ev.context))
              retain.push(ev)

        if (not retain.length)
          delete this._events[name]

    return this

  # Trigger one or many events, firing all bound callbacks. Callbacks are
  # passed the same arguments as `trigger` is, apart from the event name
  # (unless you're listening on `"all"`, which will cause your callback to
  # receive the true name of the event as the first argument).
  trigger: (name) ->
    if not this._events
       return
    args = slice.call(arguments, 1)
    if not eventsApi(this, 'trigger', name, args)
      return this
    events = this._events[name]
    allEvents = this._events.all
    results = []
    if events
      results.push triggerEvents(events, args)
    if allEvents
      results.push triggerEvents(allEvents, arguments)
    return When.all(results)
      .catch (args...) ->
        console.error "Error in event #{name}:", args...

  # Tell this object to stop listening to either specific events ... or
  # to every object it's currently listening to.
  stopListening: (obj, name, callback) ->
    listeners = this._listeners
    if not listeners
      return this
    deleteListener = not name and not callback
    if typeof name is 'object'
      callback = this
    if obj
      (listeners = {})[obj._listenerId] = obj

    for id of listeners
      listeners[id].off(name, callback, this)
      if deleteListener
        delete this._listeners[id]

    return this


# Regular expression used to split event strings.
eventSplitter = /\s+/

# Implement fancy features of the Events API such as multiple event
# names `"change blur"` and jQuery-style event maps `{change: action}`
# in terms of the existing API.
eventsApi = (obj, action, name, rest) ->
  if not name
    return true

  # Handle event maps.
  if typeof name is 'object'
    for key in name
      obj[action].apply(obj, [key, name[key]].concat(rest))

    return false

  # Handle space separated event names.
  if eventSplitter.test(name)
    names = name.split(eventSplitter)
    for name in names
      obj[action].apply(obj, [name].concat(rest))

    return false

  return true


# A difficult-to-believe, but optimized internal dispatch function for
# triggering events. Tries to keep the usual cases speedy (most internal
# Backbone events have 3 arguments).
triggerEvents = (events, args) ->
  a1 = args[0]
  a2 = args[1]
  a3 = args[2]

  switch args.length
    when 0
      return When.all(for ev in events then ev.callback.call(ev.ctx))
    when 1
      return When.all(for ev in events then ev.callback.call(ev.ctx, a1))
    when 2
      return When.all(for ev in events then ev.callback.call(ev.ctx, a1, a2))
    when 3
      return When.all(for ev in events then ev.callback.call(ev.ctx, a1, a2, a3))
    else
      return When.all(for ev in events then ev.callback.apply(ev.ctx, args))


listenMethods =
  listenTo: 'on'
  listenToOnce: 'once'

# Inversion-of-control versions of `on` and `once`. Tell *this* object to
# listen to an event in another object ... keeping track of what it's
# listening to.
_.each listenMethods, (implementation, method) ->
  Events.prototype[method] = (obj, name, callback) ->
    listeners = this._listeners or (this._listeners = {})
    id = obj._listenerId or (obj._listenerId = _.uniqueId('l'))
    listeners[id] = obj
    if (typeof name is 'object')
      callback = this
    obj[implementation](name, callback, this)
    return this

Events.eventSplitter = eventSplitter

module.exports = Events
