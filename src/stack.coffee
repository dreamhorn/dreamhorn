"use strict"
_ = require('lodash')
Events = require('./events')


class Stack extends Events
  constructor: () ->
    @clear()

  clear: (data) ->
    @_data = [null]
    @length = 0
    @trigger 'cleared', data

  push: (item, data) ->
    @length += 1
    @_data[@length] = item
    @trigger 'pushed', item, data
    return this

  peek: () ->
    return @_data[@length]

  pop: (data) ->
    if @length > 0
      @length -= 1
      popped = this._data.pop()
      @trigger 'popped', popped, data
      return popped
    else
      return undefined

  drop: (item, data) ->
    dropped = _.remove(@_data, _.matchesProperty('id', item.id))[0]
    @length = @_data.length - 1
    @trigger 'dropped', dropped, data
    return dropped


module.exports = Stack
