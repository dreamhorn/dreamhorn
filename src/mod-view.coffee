"use strict"

_ = require('lodash')
marked = require('marked')
dom = require('./dom')
templates = require('./templates')
When = require('when')
Dreamhorn = require('./dreamhorn')

class ViewModule
  events: {}

  defaults:
    template: ''
    effect_in: 'default-in'
    effect_out: 'default-out'

  constructor: (@deck, options) ->
    @options = _.defaults {}, options, @defaults, this.constructor.__super__.defaults
    @template = if @options.template
      templates.compile_template(@options.template)
    else
      () -> ''

    _.bindAll this

    @selector = @options.selector
    @el = @options.el
    @subviews = {}

  get_context: (ambient_context) ->
    return ambient_context

  will_get_ambient_context: () ->
    ambient = {}
    return @deck.will_trigger('context:get', ambient).then () ->
      return ambient

  will_get_context: (overrides) ->
    @will_get_ambient_context().then (ambient_context) =>
      local_context = @get_context(ambient_context)
      return When(local_context).then (local) =>
        return _.defaults {}, overrides, local, @options

  will_render: (overrides) ->
    @will_get_context(overrides).then (context) =>
      return templates.render_template(@template, context)

  connect_events: () ->
    for event_selector, handler_name of @events
      [event, selector] = event_selector.split(/\s+/, 2)
      handler = this[handler_name]
      if _.isFunction handler
        dom.on(@el, event, selector, handler)
    return

  disconnect_events: () ->
    for event_selector, handler_name of @events
      [event, selector] = event_selector.split(/\s+/, 2)
      handler = this[handler_name]
      if _.isFunction handler
        dom.off(@el, event, handler)
    return

  setup: () ->

  will_animate_in: () ->
    When(@el).then (el) =>
      @deck.base.effects.run(@options.effect_in, el, @options, this)

  teardown: () ->

  will_animate_out: () ->
    When(@el).then (el) =>
      @deck.base.effects.run(@options.effect_out, el, @options, this)

  start: () ->
    if @selector and not @el
      @el = dom.query(@selector)[0]
    else if not @selector and not @el
      @el = @will_render().then (html) =>
        @el = dom.make(html)[0]
    return When.join(@el, @setup())
      .then(@connect_events)


  stop: () ->
    return When.try(@disconnect_events)
      .then(@teardown)
      .then(() =>
        @el = null
      )

  will_use_subview: ({id: subview_id, type: subview_type, options: options}) ->
    mod = @subviews[subview_id] =
      id: subview_id
      instance: new subview_type(@deck, options)
      type: subview_type
      deck: @deck
      options: options
      active: false
    return @deck.will_trigger('subview:used', mod).then () =>
      return mod.instance

  get_subview: (subview_id) ->
    return @subviews[subview_id]

  will_start_subview: (subview_id) ->
    promises = []
    mod = @get_subview subview_id
    if not mod
      throw new Error "No such subview #{subview_id}"
    if not mod.active
      promises.push @deck.will_trigger 'subview:starting', mod
      if _.isFunction mod.instance.start
        promises.push mod.instance.start()
      mod.active = true
      promises.push @deck.will_trigger('subview:started', mod).then () ->
        return mod.instance
    else
      promises.push When mod.instance
    return When.all(promises).then () ->
      return mod.instance

  will_stop_subview: (subview_id) ->
    promises = []
    mod = @get_subview subview_id
    if not mod
      throw new Error "No such subview #{subview_id}"
    if mod.active
      promises.push @deck.will_trigger 'subview:stopping', mod
      if _.isFunction mod.instancpe.stop
        promises.push mod.instance.stop()
      mod.active = false
      promises.push @deck.will_trigger('subview:stopped', mod).then () ->
        return mod.instance
    else
      promises.push When mod.instance
    return When.all promises


module.exports = ViewModule
