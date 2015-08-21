"use strict"
_ = require('lodash')
Events = require('./events')
When = require('when')


class Stack extends Events
  constructor: () ->
    @clear()

  clear: (data) ->
    @_data = [null]
    @length = 0
    return @will_trigger('cleared', data).then () ->
      return data

  push: (item, data) ->
    @length += 1
    @_data[@length] = item
    @will_trigger('pushed', item, data).then () ->
      return [item, data]

  peek: () ->
    return @_data[@length]

  pop: When.lift (data) ->
    if @length > 0
      @length -= 1
      popped = this._data.pop()
      return @will_trigger('popped', popped, data).then () ->
        return [popped, data]
    else
      throw new Error("Empty stack. No item to pop!")

  drop: (item, data) ->
    dropped = _.remove(@_data, _.matchesProperty('id', item.id))[0]
    @length = @_data.length - 1
    @will_trigger('dropped', dropped, data).then () ->
      return [dropped, data]


module.exports = Stack
