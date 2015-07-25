"use strict"
_ = require('lodash')
Dict = require('collections/dict')
Stack = require('./stack')
Situation = require('./situation')
Events = require('./events')


class Dreamhorn extends Events
  constructor: (options) ->
    options = options || {}
    @options = _.defaultsDeep options, Dreamhorn.defaults
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
    @trigger "situation:add", situation
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
      @trigger 'situation:missing', data
      if _.isEmpty data
        throw new Error "No such situation #{situation_id}"
      else
        situation = new Situation(data)

    return situation

  mark_seen: (situation) ->
    seen = @seen.get situation.id
    @seen.set situation.id, if not seen then 1 else seen + 1
    @trigger "seen", situation

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
    @stack.trigger 'replaced', popped, situation, data
    return [popped, situation]



Dreamhorn.defaults =
  # The name of the situation to begin with:
  begin_situation: 'begin'

module.exports = Dreamhorn
