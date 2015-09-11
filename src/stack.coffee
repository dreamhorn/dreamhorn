"use strict"
_ = require('lodash')
Events = require('./events')
When = require('when')


class Stack extends Events
  constructor: () ->
    @will_clear()

  will_clear: (data) ->
    if not _.isUndefined @_data
      cleared = @_data.slice(1)
    else
      cleared = []
    @_data = [null]
    @length = 0
    return @will_trigger('cleared', cleared, data).then () ->
      return [cleared, data]

  will_push: (item, data) ->
    @length += 1
    @_data[@length] = item
    return @will_trigger('pushed', item, data).then () ->
      return [item, data]

  peek: () ->
    return @_data[@length]

  will_pop: When.lift (data) ->
    if @length > 0
      @length -= 1
      popped = this._data.pop()
      return @will_trigger('popped', popped, data).then () ->
        return [popped, data]
    else
      throw new Error("Empty stack. No item to pop!")

  will_drop: (item, data) ->
    dropped = _.remove(@_data, _.matchesProperty('id', item.id))[0]
    if not _.isUndefined dropped
      @length = @_data.length - 1
      @will_trigger('dropped', dropped, data).then () ->
        return [dropped, data]
    else
      throw new Error("Item not in stack: cannot drop it!")

module.exports = Stack
