"use strict"

_ = require('./util')
When = require('when')
dom = require('./dom')
assert = require('./assert')
Dreamhorn = require('./dreamhorn')
ViewModule = require('./mod-view')
templates = require('./templates')

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
        <ul class="card__choices card--{{ deck.name }}__choices">
          {{#each choices}}
          <li class="card__choices__choice">
            <a data-target="{{ raw }}" href="#">{{{ text }}}</a>
          </li>
          {{/each}}
        </div>
        {{/if}}
      </div>
      '''

  events:
    'click a': 'on_choice_click'

  get_card: () ->
    return @options.card

  get_context: (ambient_context) ->
    card = @get_card()
    _.extend ambient_context,
      card: card
      deck: @deck
    When.join(
      @will_get_header(card, ambient_context),
      @will_get_content(card, ambient_context),
      @will_get_choices(card, ambient_context)
    ).then ([header, content, choices]) =>
      return _.extend ambient_context,
        header: header
        content: content
        choices: choices

  will_get_header: (card, context) ->
    card.will_get_header().then (raw_header) =>
      header = templates.render_template(raw_header, context)
      return templates.convert_markdown_to_html header

  will_get_content: (card, context) ->
    card.will_get_content().then (raw_content) =>
      content = templates.render_template(raw_content, context)
      return templates.convert_markdown_to_html content

  will_get_choices: (card, context) ->
    card.will_get_choices().then (choices) =>
      for choice in choices
        if _.isUndefined choice.text
          choice.text = templates.render_template choice.raw_text, context
      return choices

  get_links: ->
    return dom('a', @el).map (anchor) ->
      dom.wrap(anchor)

  will_process_el: ->
    card = @get_card()
    @get_links().each ($el) =>
      if not $el.hasClass('raw') and not $el.data('target')
        href = $el.attr('href')
        $el.attr('href', '#')
        $el.attr('data-target', href)

  disable_links: ->
    @get_links().each($el) =>
      if not $el.hasClass('sticky')
        $el.addClass 'disabled'

  enable_links: ->
    @get_links().each($el) =>
      $el.removeClass 'disabled'

  setup: () ->
    @deck.on 'card:deactivate-all', @on_deactivate

  teardown: () ->
    dom.wrap(@el).empty().remove()
    @deck.off 'card:deactivate-all', @on_deactivate

  on_deactivate: () =>
    ;

  on_choice_click: (evt) =>
    $el = dom.wrap(evt.target)
    if $el.hasClass 'raw'
      # Raw links don't get processed in any way, and maintain their default
      # behavior.
      return

    evt.preventDefault()

    if $el.hasClass 'disabled'
      # Disabled links are ignored for all purposes.
      return

    card = @options.card
    target = $el.data('target')
    card.will_get_choices_by_target().then (choices) =>
      # If this is a formally-defined choice from the `choices` block:
      choice = choices[target]
      if _.isUndefined choice
        # Otherwise, we'll use the raw choice directive and parse it later.
        choice = target
      card.will_choose(choice, evt.target).then (result) =>
        if _.isString result
          dom.wrap(@el).replaceWith templates.convert_to_markdown result

module.exports = CardViewModule
