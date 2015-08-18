"use strict"

_ = require('lodash')
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
    @deck.stack.on 'replace', this.on_replace
    @deck.stack.on 'clear', this.on_reset
    @deck.on 'reset', this.on_reset

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

  # Respond to a complete reset of the stack.
  on_reset: () =>
    for cid, situation of @situations
      situation.remove()
    @situations = {}

  # Methods for doing things

  # Visually push a new situation onto the stack.
  push: (card, data) =>
    @deck.trigger('card:deactivate-all').then () =>
      @start_card_view(card).then (card_view) =>
        dom.wrap(@el).append card_view.el

  # Visually pop the top situation off the stack.
  pop: (card, data) =>
    if not _.isUndefined data
      reactivate = if _.isUndefined(data.reactivate) then true else false
    else
      reactivate = true
    situation = @get_situation_from_card card
    @run_before_exiting situation
    @remove_situation situation
    @run_after_exiting situation
    delete @situations[card.cid]
    if reactivate
      @reactivate_latest()

  will_ensure_card_view: (card, options) ->
    try
      return When @get_subview card.id
    catch error
      options = _.defaultsDeep {card: card}, options
      @will_use_subview(
        id: card.id
        type: CardView
        options: options
      )

  start_card_view: (card, options) ->
    @will_ensure_card_view(card, options).then (view) =>
      @will_start_subview card.id

  stop_card_view: (card) ->
    @ensure_card_view(card).then (view) =>
      @will_stop_subview card.id

  # # This will unlink any active links in all visible situation views, except
  # # for the one at the top of the stack.
  # unlink_all_but_last: ->
  #   _.forEach @collection.slice(0, @situations.length), (card) =>
  #     situation = @get_situation_from_card card
  #     situation.unlink()

  # # This will unlink any active links in all visible situation views.
  # unlink_all: ->
  #   @collection.forEach (card) =>
  #     situation = @get_situation_from_card card
  #     situation.unlink()

  # # This will relink deactivated links in the situation view at the top of the
  # # stack.
  # relink_latest: ->
  #   card = @collection.last()
  #   situation = @get_situation_from_card card
  #   situation.relink()

  # # This will rerenderthe situation view at the top of the stack.
  # rerender_latest: ->
  #   card = @collection.last()
  #   situation = @get_situation_from_card card
  #   situation.render()

  # # Get the SituationView for the given Situation card. If one does not
  # # already exist, create one.
  # get_situation_from_card: (card) ->
  #   if not @situations[card.cid]
  #     situation = new SituationView @options.get_options
  #       card: card
  #       el: $ config.situation_template
  #     @situations[card.cid] = situation

  #   return @situations[card.cid]

  # # Run any before-enter handlers on the situation.
  # run_before_entering: (situation) ->
  #   card = situation.card
  #   before = card.get('before_enter')
  #   if _.isFunction before
  #     before situation.options
  #   @dispatcher.trigger 'before-enter', situation

  # # Run any after-enter handlers on the situation.
  # run_after_entering: (situation) ->
  #   card = situation.card
  #   after = card.get('after_enter')
  #   if _.isFunction after
  #     after situation.options
  #   @dispatcher.trigger 'after-enter', situation

  # # Run any before-exit handlers on the situation.
  # run_before_exiting: (situation) ->
  #   card = situation.card
  #   before = card.get('before_exit')
  #   if _.isFunction before
  #     before situation.options
  #   @dispatcher.trigger 'after-exit', situation

  # # Run any after-exit handlers on the situation.
  # run_after_exiting: (situation) ->
  #   card = situation.card
  #   after = card.get('after_exit')
  #   if _.isFunction after
  #     after situation.options
  #   @dispatcher.trigger 'after-exit', situation

  # # Deactivate all displayed situations.
  # deactivate_all: ->
  #   @collection.forEach (card) =>
  #     situation = @get_situation_from_card card
  #     @deactivate_situation(situation)

  # # Deactivate the given situation view.
  # deactivate_situation: (situation) ->
  #   @dispatcher.trigger 'deactivate:situation', situation

  # # Activate the given situation view.
  # activate_situation: (situation) ->
  #   @dispatcher.trigger 'activate:situation', situation

  # # Activate the situation view at the top of the stack.
  # reactivate_latest: ->
  #   card = @collection.last()
  #   situation = @get_situation_from_card card
  #   @activate_situation(situation)

  # # Trigger the visual addition of a situation view that has been hidden or newly added.
  # show_situation: (situation) ->
  #   duration = config.base_animation_duration
  #   trigger = @dispatcher.blackboard.get('last-trigger')
  #   @dispatcher.trigger "show:situation", situation.$el, trigger
  #   # We want to make sure that the situation is always revealed, even if no
  #   # effect has been defined. Show the situation after the configured default
  #   # animation duration, no matter what.
  #   _.delay((() -> situation.$el.show()), duration)

  # # Trigger the visual removal effect (if any) for a situation view. If no
  # # effect is defined, this will not do anything.
  # remove_situation: (situation) ->
  #   trigger = @dispatcher.blackboard.get('last-trigger')
  #   @dispatcher.trigger "remove:situation", situation.$el, trigger




module.exports = CardStackViewModule
