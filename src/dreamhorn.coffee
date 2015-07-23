"use strict"
_ = require('lodash')
smokesignals = require('smokesignals')
md5 = require('md5')
Dict = require("collections/dict")


class Stack
  constructor: () ->
    smokesignals.convert this
    @clear()

  clear: (data) ->
    @_data = [null]
    @length = 0
    @emit 'cleared', data

  push: (item, data) ->
    @length += 1
    @_data[@length] = item
    @emit 'pushed', item, data
    return this

  peek: () ->
    return @_data[@length]

  pop: (data) ->
    if @length > 0
      @length -= 1
      popped = this._data.pop()
      @emit 'popped', popped, data
      return popped
    else
      return undefined

  drop: (item, data) ->
    dropped = _.remove(@_data, _.matchesProperty('id', item.id))[0]
    @length = @_data.length - 1
    @emit 'dropped', dropped, data
    return dropped


class Dispatcher
  constructor: () ->
    smokesignals.convert(this)


class Situation
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


class Dreamhorn
  constructor: (options) ->
    smokesignals.convert(this)
    options = options || {}
    @options = _.defaultsDeep options, Dreamhorn.defaults
    @dispatcher = new Dispatcher()
    @stack = new Stack()
    @situations_by_id = new Dict()
    @situations_in_order = []

    @seen = new Dict()

    @on "begin", () =>
      @push {target: @options.begin_situation || 'begin'}

    @on "replace", @replace

    @on "push", @push

    @on "pop", @pop

    @on "drop", @drop

    @on "clear", @clear

  situation: (id, data) ->
    return @add_situation new Situation(id, data)

  add_situation: (situation) ->
    situation.index = @situations_in_order.length
    @situations_by_id.set situation.id.toLowerCase(), situation
    @situations_in_order.push situation
    @emit "situation:add", situation
    return situation

  get_situation: (situation_id) ->
    if situation_id == '-->'
      # Get the next situation in sequence
      current = @stack.peek()
      situation = @situations_in_order[current.index + 1]
      situation_id = situation.id
    else
      situation = @situations_by_id.get situation_id.toLowerCase()
    if not situation
      data = {}
      @emit 'situation:missing', data
      if _.isEmpty data
        throw new Error "No such situation #{situation_id}"
      else
        situation = new Situation(data)

    return situation

  mark_seen: (situation) ->
    seen = @seen.get situation.id
    @seen.set situation.id, if not seen then 1 else seen + 1
    @emit "seen", situation

  push: (data) =>
    if _.isString data
      data = {target: data}
    situation_id = data.target

    situation = @get_situation situation_id
    @stack.push situation, data
    @mark_seen situation
    return situation

  pop: (data) =>
    return @stack.pop(data)

  drop: (data) =>
    return @stack.drop data.from_situation, data

  clear: (data) =>
    @stack.clear data
    return @push data

  replace: (data) =>
    popped = @pop data
    situation = @push data
    @stack.emit 'replaced', popped, situation, data
    return [popped, situation]



Dreamhorn.defaults =
  # The name of the situation to begin with:
  begin_situation: 'begin'

Dreamhorn.Dispatcher = Dispatcher
Dreamhorn.Stack = Stack
Dreamhorn.Situation = Situation

module.exports = Dreamhorn
