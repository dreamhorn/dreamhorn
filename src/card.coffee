"use strict"
_ = require('lodash')
md5 = require('md5')


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


module.exports = Card
