"use strict"
_ = require('lodash')
bonzo = require('bonzo')
qwery = require('qwery')
bean = require('bean')

dom = (selector) ->
    return bonzo(qwery(selector))

_.extend dom,
  query: (selector) ->
    return qwery(selector)

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
