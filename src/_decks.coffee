"use strict"
_ = require('lodash')

class Decks
  constructor: (@base, @options) ->
    @_decks = {}

  define: (name, options={}) ->
    options = _.defaultsDeep(options, @options)
    options.name = name
    options.base = @base
    @_decks[name] = deck = new @options.deck_type(options)
    @base.trigger 'deck:new', deck, options
    return deck

  get: (name) ->
    deck = @_decks[name]
    if not deck
      throw new Error("No such deck #{name}!")
    return deck


module.exports = Decks
