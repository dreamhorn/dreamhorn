"use strict"

_ = require('lodash')
When = require('when')
dom = require('./dom')
assert = require('./assert')
Dreamhorn = require('./dreamhorn')
ViewModule = require('./mod-view')


class CardViewModule extends ViewModule
  defaults:
    template: '''
      <div class="card card--{{ deck.name }} shadow--2dp" id="card-{{ deck.name }}-{{ card.id }}">
        {{#if header}}
        <div class="card__header card--{{ deck.name }}__header">
          {{{ header }}}
        </div>
        {{/if}}
        <div class="card__main card--{{ deck.name }}__main">
          {{{ content }}}
        </div>
        {{#if choices}}
        <div class="card__choices card--{{ deck.name }}__choices">
          {{{ choices }}}
        </div>
        {{/if}}
      </div>
      '''

  events: {}

  get_context: () ->
    card = @options.card
    When.join(
      @will_get_header(card),
      @will_get_content(card),
      @will_get_choices(card)
    ).then ([header, content, choices]) =>
      return {
        deck: @deck
        card: card
        header: header
        content: content
        choices: choices
      }

  will_get_header: (card) ->
    When(card.will_get_header(@options, @deck)).then (header) =>
      return @convert_to_markdown header

  will_get_content: (card) ->
    When(card.will_get_content(@options, @deck)).then (content) =>
      return @convert_to_markdown content

  will_get_choices: (card) ->
    When(card.will_get_choices(@options, @deck)).then (choices) =>
      return choices

      # for text, directive of choices
      #   text = @render_template(text, context)
      #   text = _.trimRight(text)
      #   if not _.isString directive
      #     id = directive.get('id')
      #     action = @options.default_action
      #     directive = "#{action}!#{id}"
      #   # If the choice text ends with /... or /...., prepend it to
      #   # the next situation.
      #   if text.match /\/(\.\.\.|…).?$/
      #     # If the choice text ends with /.... (four dots), prepend it with a
      #     # newline.
      #     prepend_newline = text.match /\/(\.\.\.|…)\./
      #     text = _.trimRight(_.trimRight(text, '.'), '/')
      #     # If the text has [optional text] in square brackets, the optional
      #     # text goes in the choice, and the text following that is prepended
      #     # in the next situation.
      #     optional_p = /^(.+?)\[(.*?)\](.*)$/
      #     matched = text.match optional_p
      #     if matched
      #       prepend_text = matched[1] + matched[3]
      #       anchor_text = matched[1] + matched[2]
      #     else
      #       prepend_text = anchor_text = text
      #   else
      #     anchor_text = text
      #     prepend_text = ''
      #     prepend_newline = false
      #   html = @convert_to_markdown anchor_text
      #   choice_context = _.extend {}, {directive: directive, html: html}, context
      #   $choice = $ choice_template choice_context
      #   $a = $choice.find('a').first()
      #   # Rather than set the `data-` attributes in the template, we'll use Zepto
      #   # to set data on the DOM element directly, so we don't have to worry
      #   # about serialization concerns.
      #   $a.data('prepend', prepend_text)
      #   $a.data('prepend-newline', prepend_newline)
      #   $choices.append $choice

  setup: () ->
    @deck.on 'card:deactivate-all', @on_deactivate

  teardown: () ->
    dom.wrap(@el).empty()
    @deck.off 'card:deactivate-all', @on_deactivate

  on_deactivate: () =>
    ;


module.exports = CardViewModule
