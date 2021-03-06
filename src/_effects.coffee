"use strict"
_ = require('./util')
When = require('when')


class Effects
  constructor: (options) ->
    @options = _.defaults({}, options)
    @_effects = {}

    @define 'default-in', (el, options) ->
      require('./dom').wrap(el).show()

    @define 'default-out', (el, options) ->
      require('./dom').wrap(el).hide()

  define: (name, runner) ->
    @_effects[name] = runner

  get: (name) ->
    effect = @_effects[name]
    if not effect
      throw new Error("No such effect #{name}!")
    return effect

  run: (name, el, options) ->
    options = _.defaults({}, options, @options)
    try
      return When.try @get(name), el, options
    catch error
      console.error error
      return When false

module.exports = Effects
