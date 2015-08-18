"use strict"

_ = require('lodash')
Dict = require('collections/dict')
When = require('when')

Stack = require('./stack')
Card = require('./situation')
Events = require('./events')
Deck = require('./deck')
Decks = require('./_decks')
Effects = require('./_effects')
assert = require('./assert')


class Dreamhorn extends Events
  constructor: (options) ->
    options = options || {}
    @options = _.defaultsDeep {}, options, Dreamhorn.defaults

    @decks = new Decks(this, @options)
    @decks.define(@options.main_deck)

    @effects = new Effects(@options)

    @modules = {}

    @on 'all', (event, args...) =>
      console.debug "*#{event}* event on Dreamhorn core:", args...
      @decks.trigger(event, args...)

  extend: (extensions) ->
    _.extend(this, extensions)
    return this

  will_use_module: ({id: module_id, type: module_type, deck: deck_id, options: options}) ->
    deck = @decks.get deck_id || @options.main_deck
    options = _.defaultsDeep {}, options, @options
    mod = @modules[module_id] =
      id: module_id
      instance: new module_type(deck, options)
      type: module_type
      deck: deck_id
      options: options
      active: false
    return @trigger('module:used', mod).then () =>
      return mod.instance

  get_module: (module_id) ->
    mod = @modules[module_id]
    if not mod
      throw new Error("No such module instance with id #{module_id}!")
    return mod

  will_start_module: (module_id) ->
    promises = []
    mod = @get_module module_id
    if not mod.active
      promises.push @trigger 'module:starting', mod
      if _.isFunction mod.instance.start
        promises.push mod.instance.start()
      mod.active = true
      promises.push @trigger('module:started', mod).then () =>
        return mod.instance
    else
      promises.push When mod.instance
    return When.all promises

  will_stop_module: (module_id) ->
    promises = []
    mod = @get_module module_id
    if mod.active
      promises.push @trigger 'module:stopping', mod
      if _.isFunction mod.instance.stop
        promises.push mod.instance.stop()
      mod.active = false
      promises.push @trigger('module:stopped', mod).then () =>
        return mod.instance
    else
      promises.push When mod.instance
    return When.all promises

  will_start_all_modules: () ->
    return When.all @start_module(module_id) for module_id of @modules

  will_stop_all_modules: () ->
    return When.all @stop_module(module_id) for module_id of @modules

  with_deck: (deck_id='main', callback) ->
    callback @decks.get(deck_id)


Dreamhorn.extend = (extensions) ->
  _.extend(Dreamhorn.prototype, extensions)


Dreamhorn.extend_defaults = (extensions) ->
  _.extend(Dreamhorn.defaults, _.defaultsDeep({}, extensions, Dreamhorn.defaults))

Dreamhorn.defaults =
  deck_type: Deck
  main_deck: 'main'


module.exports = Dreamhorn
