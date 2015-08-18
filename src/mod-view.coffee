"use strict"

_ = require('lodash')
marked = require('marked')
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

  will_get_ambient_context: () ->
    ambient = {}
    return @deck.trigger('context:get', ambient).then () ->
      return ambient

  will_get_context: (overrides) ->
    ambient_context = @will_get_ambient_context()
    local_context = When @get_context()
    return When.join(local_context, ambient_context).then ([ambient, local]) =>
      return _.defaultsDeep {}, overrides, local, ambient, @options

  will_render: (overrides) ->
    context_p = @will_get_context(overrides)
    return @will_render_template(@template, context_p)

  will_render_template: (template, context) ->
    compiled_p = @will_get_compiled_template(template)
    context_p = When context
    When.join(compiled_p, context_p).then ([compiled, context]) ->
      return compiled(context)

  convert_to_markdown: (text) ->
    return marked text

  will_get_compiled_template: (template) ->
    if _.isFunction template
      promised = When template
    else
      if _template_cache.has(template)
        promised = When _template_cache.get(template)
      else
        promised = @will_convert_to_template(template).then (render) ->
          _template_cache.set(template, render)
          return render
    return promised

  will_convert_to_template: (content) ->
    # The content may itself be a function which must resolve to a
    # string.
    if _.isFunction content
      content = content(@options, @deck)

    # For Lodash templates, we'll provide some useful default context.
    _imports =
      pronoun: pronoun
      _: _

    # We'll also offer the chance for custom handlers to extend the Lodash
    # context.
    return @deck.trigger('set-template-imports', _imports).then () =>
      # Now, we compile the Handlebars template.
      template = Handlebars.compile content

      # And we return a wrapper function which will apply the lodash template to
      # the rendered Handlebars template, and render that. Sure, it's a bit
      # inefficient, but it works.
      return (context) ->
        result = template context
        _tmpl = _.template result,
          imports: _imports
        return _tmpl context

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
    @deck.base.effects.run(@options.effect_in, @el, @options, this)

  teardown: () ->

  will_animate_out: () ->
    @deck.base.effects.run(@options.effect_out, @el, @options, this)

  start: () ->
    if @selector and not @el
      @el = dom.query(@selector)[0]
    else if not @selector and not @el
      @el = @will_render().then (html) =>
        @el = dom.make html
    return When.join(@el, @setup())
      .then(@will_animate_in)
      .then(@connect_events)


  stop: () ->
    return When.try(@disconnect_events)
      .then(@will_animate_out)
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
    return @deck.trigger('subview:used', mod).then () =>
      return mod.instance

  get_subview: (subview_id) ->
    mod = @subviews[subview_id]
    if not mod
      throw new Error("No such subview instance with id #{subview_id}!")
    return mod

  will_start_subview: (subview_id) ->
    promises = []
    mod = @get_subview subview_id
    if not mod.active
      promises.push @deck.trigger 'subview:starting', mod
      if _.isFunction mod.instance.start
        promises.push mod.instance.start()
      mod.active = true
      promises.push @deck.trigger('subview:started', mod).then () ->
        return mod.instance
    else
      promises.push When mod.instance
    return When.all(promises).then () ->
      return mod.instance

  will_stop_subview: (subview_id) ->
    promises = []
    mod = @get_subview subview_id
    if mod.active
      promises.push @deck.trigger 'subview:stopping', mod
      if _.isFunction mod.instancpe.stop
        promises.push mod.instance.stop()
      mod.active = false
      promises.push @deck.trigger('subview:stopped', mod).then () ->
        return mod.instance
    else
      promises.push When mod.instance
    return When.all promises


module.exports = ViewModule
