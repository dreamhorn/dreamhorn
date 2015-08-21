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
    @base.will_trigger 'deck:new', deck, options
    return deck

  get: (id) ->
    deck = @_decks[id]
    if not deck
      throw new Error("No such deck #{id}!")
    return deck

  all: () ->
    return _.values @_decks

  will_trigger: (event, args...) ->
    When.all((
      for id, deck of @_decks
      deck.will_trigger(event, args...)
    ))


module.exports = Decks
