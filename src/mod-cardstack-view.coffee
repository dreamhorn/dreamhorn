"use strict"

_ = require('./util')
dom = require('./dom')
assert = require('./assert')
Dreamhorn = require('./dreamhorn')
ViewModule = require('./mod-view')
CardView = require('./mod-card-view')
When = require('when')


class CardStackViewModule extends ViewModule
  events: {}

  setup: () ->
    @deck.stack.on 'pushed', this.on_push
    @deck.stack.on 'popped', this.on_pop
    @deck.stack.on 'dropped', this.on_drop
    @deck.stack.on 'replace', this.on_replace
    @deck.stack.on 'cleared', this.on_reset
    @deck.stack.on 'cleared', this.on_clear

    @deck.on 'deactivate-all', this.on_deactivate_all

  # Stack event handlers
  # --------------------
  #
  # Respond to a situation being pushed onto the stack.
  on_push: (card, data) =>
    @push card, data

  # Respond to a situation replacing the top situation on the stack.
  on_replace: (popped, pushed, data) =>
    data.reactivate = false
    @pop popped, data
    @push pushed, data

  # Respond to a situation being popped off the top of the stack.
  on_pop: (card, data) =>
    @pop card, data

  on_drop: (card, data) =>
    @drop card, data

  # Respond to a complete reset of the stack.
  on_clear: (cleared, data) =>
    for card in cleared
      @drop(card)

  on_deactivate_all: () =>
    for view in @get_card_views()
      view.disable_links()

  # Methods for doing things

  # Visually push a new situation onto the stack.
  push: (card, data) =>
    @deck.will_trigger('deactivate-all').then () =>
      @will_start_card_view(card).then (card_view) =>
        dom.wrap(@el).append card_view.el
        card_view.will_animate_in()

  # Visually pop the top situation off the stack.
  pop: (card, data) =>
    if not _.isUndefined data
      reactivate = if _.isUndefined(data.reactivate) then true else false
    else
      reactivate = true

    @drop(card)

  drop: (card, data) =>
    @will_stop_card_view(card)

  get_card_views: ->
    return (@get_subview(card.id) for card in @deck.cards_in_order)

  will_ensure_card_view: (card, options) ->
    subview = @get_subview card.id
    if _.isUndefined subview
      options = _.defaults {card: card}, options
      subview = @will_use_subview(
        id: card.id
        type: CardView
        options: options
      )
    return When subview

  will_start_card_view: (card, options) ->
    @will_ensure_card_view(card, options).then (view) =>
      @will_start_subview card.id

  will_stop_card_view: (card) ->
    @will_ensure_card_view(card).then (view) =>
      @will_stop_subview card.id




module.exports = CardStackViewModule
