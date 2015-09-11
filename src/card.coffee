"use strict"
_ = require('lodash')
md5 = require('md5')
When = require('when')
templates = require('./templates')


class Card
  constructor: ({id, @deck, data}) ->
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

    @default_action = @default_action or 'push'



  will_get_attribute: When.lift (name, _default='') ->
    value = this[name]
    if _.isFunction value
      value = value.call(this)
    When(value).then (value) ->
      return value or _default

  will_get_header: () ->
    if not _.isUndefined @_header
      return When @_header
    else
      @will_get_attribute('header').then (header) =>
        @_header = header
        return header

  will_get_content: () ->
    if not _.isUndefined @_content
      return When @_content
    else
      @will_get_attribute('content').then (content) =>
        @_content = content
        return content

  will_get_choices: () ->
    if not _.isUndefined @_choices
      return When @_choices
    else
      @will_get_attribute('choices', _default={}).then (raw_choices) =>
        choices = @_choices = []
        for raw_text, directive of raw_choices
          if _.isString directive
            choice = @parse_directive raw_text, directive
          else
            choice = directive
            if not directive.raw
              choice.raw = "#{directive.action}!#{directive.name}"
          choice.raw_text = raw_text
          choices.push choice
        return choices

  will_get_choices_by_target: () ->
    if not _.isUndefined @_choices_by_target
      return When @_choices_by_target
    else
      @will_get_choices().then (choices) =>
        cbt = {}
        for choice in choices
          cbt[choice.raw] = choice
        @choices_by_target = cbt
        return cbt

  will_choose: (choice, el) ->
    if @is_action choice.action
      return When this.actions[choice.action](this, el)
    else
      @deck.will_trigger(choice.action, choice).then () ->
        return

  is_action: (event) ->
    # this.actions *must* be an object!
    actions = this.actions
    if actions
      return event of actions
    else
      return false

  parse_directive: (raw_text, raw_directive) ->
    data = {
      action: undefined
      raw_text: raw_text
      raw: raw_directive
      from_card: this
    }
    if raw_directive == '!'
      if @is_action text
        # !: Trigger an event of the same name as anchor text
        data.action = text
      else
        data.action = @default_action
        data.target = text

    else if '!' in raw_directive
      if _.startsWith raw_directive, '!'
        # !event: Trigger the event named
        data.action = _.trimLeft raw_directive, '!'
      else
        # action!arg: Call the action with the given argument
        [data.action, data.target] = raw_directive.split '!', 2

    else if raw_directive == '-->'
      data.action = @default_action
      data.target = @deck.get_card_after(this).id

    else
      data.action = @deck.options.default_action
      data.target = raw_directive

    if not data.target
      data.target = raw_text.toLowerCase()

    data.action = data.action.toLowerCase()

    return data


module.exports = Card
