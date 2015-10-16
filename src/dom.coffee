"use strict"
_ = require('lodash')
bonzo = require('bonzo')
qwery = require('qwery')
bean = require('bean')
bonzo.setQueryEngine(qwery)

dom = (selector, context) ->
    return bonzo(qwery(selector, context))

_.extend dom,
  query: (selector, context) ->
    return qwery(selector, context)

  wrap: (el) ->
    return bonzo(el)

  make: (html) ->
    return bonzo.create(html)

  on: (args...) ->
    return bean.on(args...)

  one: (args...) ->
    return bean.one(args...)

  off: (args...) ->
    return bean.off(args...)

  clone: (args...) ->
    return bean.clone(args...)

  fire: (args...)   ->
    return bean.fire(args...)

module.exports = dom
