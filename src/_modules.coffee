"use strict"
_ = require('lodash')


_mod_types = {}
_mod_instances = {}


class Modules
  constructor: (@base, @options) ->

  define_type: (module_type, constructor) ->
    _mod_types[module_type] = constructor

  get_type: (module_type) ->
    mod_type = _mod_types[module_type]
    if not mod_type
      throw new Error("No such module type #{module_type}!")
    return mod_type

  get: (module_id) ->
    mod = _mod_instances[module_id]
    if not mod
      throw new Error("No such module instance with id #{module_id}!")
    return mod

  use: ({id: module_id, type: module_type, deck: deck_id, options: {}}) ->
    constructor = new @modules.get_type(module_type)
    deck = @base.decks.get deck_id
    options = _.defaultsDeep options, @options
    mod = _mod_instances[module_id] =
      id: module_id
      instance: new constructor(deck, options)
      type: module_type
      deck: deck_id
      options: options
      active: false
    @base.trigger 'module:used', mod
    return this

  start: (module_id) ->
    mod = @get module_id
    if _.isFunction mod.instance.start
      mod.instance.start()
    mod.active = true
    @base.trigger 'module:started', mod

  stop: (module_id) ->
    mod = @get module_id
    if _.isFunction mod.instance.stop
      mod.instance.stop()
    mod.active = false
    @base.trigger 'module:stopped', mod


module.exports = Modules
