"use strict"

Handlebars = require('handlebars')
_ = require('./util')
marked = require('marked')
Dict = require('collections/dict')


module.exports =
  _template_cache: new Dict()

  compile_template: (content, _imports) ->
    # For Lodash templates, we'll provide some useful default context.
    _imports = _imports or {_: _}

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

  get_compiled_template: (template) ->
    if _.isFunction template
      render = template
    else
      if @_template_cache.has(template)
        render = When _template_cache.get(template)
      else
        render = @compile_template(template)

    return render

  render_template: (template, context) ->
    render = @get_compiled_template(template)
    return render context

  convert_markdown_to_html: (text) ->
    return marked text
