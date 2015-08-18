"use strict"
_ = require('lodash')
md5 = require('md5')
When = require('when')


class Card
  constructor: (id, data) ->
    if _.isUndefined data
      data = id
      id = undefined

    if _.isString data
      data = {content: data, id: id}

    if not data.id
      if not id
        data.id = md5(JSON.stringify(data))
      else
        data.id = id

    data.id = data.id.toLowerCase()

    _.assign this, data
    @index = null

  will_get_attribute: When.lift (name, options, deck, _default='') ->
    value = this[name]
    if _.isFunction value
      value = value(options, deck)
    When(value).then (value) ->
      return value or _default

  will_get_header: (options, deck) ->
    return @will_get_attribute('header', options, deck)

  will_get_content: (options, deck) ->
    return @will_get_attribute('content', options, deck)

  will_get_choices: (options, deck) ->
    choices = @will_get_attribute('choices', options, deck, _default={})


module.exports = Card
