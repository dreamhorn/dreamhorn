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

    @default_action = @defalut_action or 'push'

  will_get_attribute: When.lift (name, options, deck, _default='') ->
    value = this[name]
    if _.isFunction value
      value = value.call(this, options, deck)
    When(value).then (value) ->
      return value or _default

  will_get_header: (options, deck) ->
    return @will_get_attribute('header', options, deck)

  will_get_content: (options, deck) ->
    return @will_get_attribute('content', options, deck)

  will_get_choices: (options, deck) ->
    choices = []
    got_choices = @will_get_attribute('choices', options, deck, _default={})
    got_choices.then (raw_choices) ->
      for raw_text, directive of raw_choices
        if not _.isString directive
          directive = "#{directive.action}!#{directive.name}"
        choices.push
          raw_text: raw_text
          directive: directive
      return choices

  is_action: (event) ->
    # this.actions *must* be an object!
    actions = this.actions
    if actions
      return event of actions
    else
      return false

  parse_directive: (text, directive) ->
    data = {action: undefined, text: text, directive: directive}
    if directive == '!'
      if @is_action text
        # !: Trigger an event of the same name as anchor text
        data.action = text
      else
        data.action = @default_action
        data.target = text

    else if '!' in directive
      if _.startsWith directive, '!'
        # !event: Trigger the event named
        data.action = _.trimLeft directive, '!'
      else
        # action!arg: Call the action with the given argument
        [data.action, data.target] = directive.split '!', 2

    else if directive == '-->'
      data.action = @default_action
      data.target = @deck.get_card_after(@id).id

    else
      data.action = config.default_action
      data.target = directive

    if not data.target
      data.target = text.toLowerCase()

    data.action = data.action.toLowerCase()

    return data


module.exports = Card
