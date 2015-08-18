"use strict"
_ = require('lodash')

class Decks
  constructor: (@base, @options) ->
    @_decks = {}

  define: (name, options={}) ->
    options = _.defaultsDeep({}, options, @options)
    options.name = name
    options.base = @base
    @_decks[name] = deck = new @options.deck_type(options)
    @base.trigger 'deck:new', deck, options
    return deck

  get: (id) ->
    deck = @_decks[id]
    if not deck
      throw new Error("No such deck #{id}!")
    return deck

  all: () ->
    return _.values @_decks

  trigger: (event, args...) ->
    for id, deck of @_decks
      deck.trigger(event, args...)


module.exports = Decks
