"use strict"

assert = require('./assert')
dom = require('./dom')
Dreamhorn = require('./dreamhorn')
ViewModule = require('./mod-view')


class BeginViewModule extends ViewModule
  defaults:
    begin_text: 'Begin!'
    template: '<a class="button button--primary begin-box__btn" id="begin-btn" href="#">{{ begin_text }}</a>'

  events:
    'click a#begin-btn': 'on_begin'

  setup: () ->
    @will_render().then (html) =>
      dom.wrap(@el).append(html)
      @will_animate_in()

  teardown: () ->
    dom.wrap(@el).empty()

  on_begin: (evt) =>
    @deck.broadcast 'begin'


module.exports = BeginViewModule
