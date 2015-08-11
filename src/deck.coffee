"use strict"
_ = require('lodash')
Dict = require('collections/dict')
Stack = require('./stack')
Card = require('./card')
Events = require('./events')


class Deck extends Events
  constructor: (options) ->
    options = options || {}
    @options = _.defaultsDeep {}, options, Deck.defaults
    @name = @options.name
    @base = @options.base

    @stack = new Stack()
    @cards_by_id = new Dict()
    @cards_in_order = []

    @seen = new Dict()

    @on 'replace', @replace

    @on 'push', @push

    @on 'pop', @pop

    @on 'drop', @drop

    @on 'clear', @clear

    @on 'all', (event, args...) =>
      console.debug "*#{event}* event on #{@options.name}:", args...

  card: (id, data) ->
    return @add_card new Card(id, data)

  add_card: (card) ->
    card.index = @cards_in_order.length
    @cards_by_id.set card.id.toLowerCase(), card
    @cards_in_order.push card
    @trigger 'card:add', card
    return card

  get_card: (card_id) ->
    if card_id == '-->'
      # Get the next card in sequence
      current = @stack.peek()
      card = @cards_in_order[current.index + 1]
      card_id = card.id
    else
      card = @cards_by_id.get card_id.toLowerCase()
    if not card
      data = {}
      @trigger 'card:missing', data
      if _.isEmpty data
        throw new Error "No such card #{card_id}"
      else
        card = new Card(data)

    return card

  mark_seen: (card) ->
    seen = @seen.get card.id
    @seen.set card.id, if not seen then 1 else seen + 1
    @trigger 'seen', card

  push: (data) =>
    if _.isString data
      data = {target: data}
    card_id = data.target

    card = @get_card card_id
    @stack.push card, data
    @mark_seen card
    return card

  pop: (data) =>
    return @stack.pop(data)

  drop: (data) =>
    return @stack.drop data.from_card, data

  clear: (data) =>
    @stack.clear data
    return @push data

  replace: (data) =>
    popped = @pop data
    card = @push data
    @stack.trigger 'replaced', popped, card, data
    return [popped, card]

  extend: (extensions) ->
    _.extend(this, extensions)
    return this

  broadcast: (event, args...) ->
    @base.trigger(event, args...)
    for deck in @base.decks.all()
      if deck is not this
        deck.trigger(event, args...)

  send_to_deck: (deck_id, event, args...) ->
    @base.decks.get(deck_id).trigger(event, args...)


Deck.defaults =
  # The name of the card to begin with:
  begin_card: 'begin'


Deck.extend = (extensions) ->
  _.extend(Deck.prototype, extensions)


Deck.extend_defaults = (extensions) ->
  Deck.defaults = _.defaultsDeep({}, extensions, Deck.defaults)


module.exports = Deck
