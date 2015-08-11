"use strict"

dom = require('./dom')
assert = require('./assert')
Dreamhorn = require('./dreamhorn')
ViewModule = require('./mod-view')


class CardViewModule extends ViewModule
  defaults:
    template: '''
      <div class="card" id="card-{{ deck.name }}-{{ card.id }}">
        <div class="card-header">
          {{ header }}
        </div>
        <div class="card-inner">
          {{ card.content }}
        </div>
        <div class="card-footer">
          {{ footer }}
        </div>
      </div>
      '''

  events: {}

  get_context: () ->
    return {
      deck: @deck
      card: @options.card
    }

  setup: () ->
    @deck.on 'card:deactivate-all', @on_deactivate

  teardown: () ->
    dom.wrap(@el).empty()
    @deck.off 'card:deactivate-all', @on_deactivate

  on_deactivate: () =>
    ;


module.exports = CardViewModule
