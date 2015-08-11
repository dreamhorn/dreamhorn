"use strict"

_ = require('lodash')
dom = require('./dom')
Dict = require('collections/dict')
When = require('when')
Handlebars = require('handlebars')
Dreamhorn = require('./dreamhorn')

_template_cache = new Dict()


class ViewModule
  events: {}

  defaults:
    template: ''
    effect_in: 'default-in'
    effect_out: 'default-out'

  constructor: (@deck, options) ->
    @options = _.defaultsDeep {}, options, @defaults, this.constructor.__super__.defaults
    @template = if @options.template
      Handlebars.compile(@options.template)
    else
      () -> ''

    _.bindAll this

    @selector = @options.selector
    @el = @options.el
    @subviews = {}

  get_context: () ->
    return {}

  render: (context) ->
    return @render_template(@template, context)

  render_template: (template, context) ->
    context = context || {}
    ambient = {}
    @deck.trigger 'context:get', ambient
    ctx = _.defaultsDeep {}, context, @get_context(), @options, ambient
    return @get_compiled_template(template)(ctx)

  get_compiled_template: (template) ->
    if _.isFunction template
      render = template
    else
      if _template_cache.has(template)
        render = _template_cache.get(template)
      else
        render = Handlebars.compile(template)
        _template_cache.set(template, render)
    return render

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

  animate_in: () ->
    @deck.base.effects.run(@options.effect_in, @el, @options, this)

  teardown: () ->

  animate_out: () ->
    @deck.base.effects.run(@options.effect_out, @el, @options, this)

  start: () ->
    if @selector and not @el
      @el = dom.query(@selector)[0]
    else if not @selector and not @el
      @el = dom.make @render()
    When.try(@setup)
      .then(@animate_in)
      .then(@connect_events)


  stop: () ->
    When.try(@disconnect_events)
      .then(@animate_out)
      .then(@teardown)
      .then(() =>
        @el = null
      )

  use_subview: ({id: subview_id, type: subview_type, options: options}) ->
    mod = @subviews[subview_id] =
      id: subview_id
      instance: new subview_type(@deck, options)
      type: subview_type
      deck: @deck
      options: options
      active: false
    return @deck.trigger('subview:used', mod).then () =>
      return mod.instance

  get_subview: (subview_id) ->
    mod = @subviews[subview_id]
    if not mod
      throw new Error("No such subview instance with id #{subview_id}!")
    return mod

  start_subview: (subview_id) ->
    mod = @get_subview subview_id
    if not mod.active
      @deck.trigger 'subview:starting', mod
      if _.isFunction mod.instance.start
        mod.instance.start()
      mod.active = true
      return @deck.trigger('subview:started', mod).then () ->
        return mod.instance
    else
      return When mod.instance

  stop_subview: (subview_id) ->
    mod = @get_subview subview_id
    if mod.active
      @deck.trigger 'subview:stopping', mod
      if _.isFunction mod.instance.stop
        mod.instance.stop()
      mod.active = false
      return @deck.trigger('subview:stopped', mod).then () ->
        return mod.instance
    else
      return When mod.instance


module.exports = ViewModule
