"use strict"

assert = require('./assert')
dom = require('./dom')
Dreamhorn = require('./dreamhorn')
ViewModule = require('./mod-view')


class BeginViewModule extends ViewModule
  defaults:
    begin_text: 'Begin!'
    template: '<p id="begin-button"><a class="begin" href="#">{{ begin_text }}</a></p>'

  events:
    "click a.begin": "on_begin"

  setup: () ->
    dom.wrap(@el).append(@render())

  teardown: () ->
    dom.wrap(@el).empty()

  on_begin: (evt) =>
    @deck.broadcast 'begin'


module.exports = BeginViewModule
