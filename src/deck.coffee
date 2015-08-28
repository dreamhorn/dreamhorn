"use strict"
_ = require('lodash')
Dict = require('collections/dict')
Stack = require('./stack')
Card = require('./card')
Events = require('./events')
When = require('when')

class Deck extends Events
  constructor: (options) ->
    options = options || {}
    @options = _.defaults {}, options, Deck.defaults
    @name = @options.name
    @base = @options.base

    @stack = new Stack()
    @cards_by_id = new Dict()
    @cards_in_order = []

    @seen = new Dict()

    @on 'replace', @will_replace

    @on 'push', @will_push

    @on 'pop', @will_pop

    @on 'drop', @will_drop

    @on 'clear', @will_clear

    @on 'all', (event, args...) =>
      console.debug "*#{event}* event on #{@options.name}:", args...

  card: (id, data) ->
    return @add_card new Card({id: id, deck: this, data: data})

  add_card: (card) ->
    card.index = @cards_in_order.length
    @cards_by_id.set card.id.toLowerCase(), card
    @cards_in_order.push card
    @will_trigger 'card:add', card
    return card

  get_card_after: (card_id) ->
    current = @stack.peek()
    return @cards_in_order[current.index + 1]

  will_get_card: When.lift (card_id) ->
    if card_id == '-->'
      card = @get_card_after card_id
      card_id = card.id
    else
      card = @cards_by_id.get card_id.toLowerCase()
    if not card
      data = {}
      return @will_trigger('card:missing', data).then () =>
        if _.isEmpty data
          throw new Error("No such card #{card_id}")
        else
          return new Card(data)
    else
      return card

  mark_seen: (card) ->
    seen = @seen.get card.id
    @seen.set card.id, if not seen then 1 else seen + 1
    @will_trigger 'seen', card

  will_push: (data) =>
    if _.isString data
      data = {target: data}
    card = data.target
    if _.isString card
      card = @will_get_card card

    When(card).then (card) =>
      @stack.will_push(card, data).then () =>
        @mark_seen card
        return card

  will_pop: (data) =>
    return @stack.will_pop(data)

  will_drop: (data) =>
    When(data.from_card).then (card) =>
      return @stack.will_drop data.from_card, data

  will_clear: (data) =>
    @stack.will_clear(data).then () =>
      return @will_push data

  will_replace: (data) =>
    @will_pop(data).then (popped) =>
      card = @will_push data
      @stack.will_trigger('replaced', popped, card, data).then () ->
        return [popped, card]

  extend: (extensions) ->
    _.extend(this, extensions)
    return this

  broadcast: (event, args...) ->
    @base.will_trigger(event, args...)
    for deck in @base.decks.all()
      if deck is not this
        deck.will_trigger(event, args...)

  send_to_deck: (deck_id, event, args...) ->
    @base.decks.get(deck_id).will_trigger(event, args...)


Deck.defaults =
  # The name of the card to begin with:
  begin_card: 'begin'


Deck.extend = (extensions) ->
  _.extend(Deck.prototype, extensions)


Deck.extend_defaults = (extensions) ->
  Deck.defaults = _.defaults({}, extensions, Deck.defaults)


module.exports = Deck
