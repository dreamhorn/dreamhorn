"use strict"

_ = require('lodash')
Dict = require('collections/dict')
Stack = require('./stack')
Card = require('./situation')
Events = require('./events')
Deck = require('./deck')
Modules = require('./_modules')
Decks = require('./_decks')


class Dreamhorn extends Events
  constructor: (options) ->
    options = options || {}
    @options = _.defaultsDeep options, Dreamhorn.defaults

    @decks = new Decks(this, @options)
    @decks.define('main')

    @modules = new Modules(this, @options)

  extend: (extensions) ->
    _.extend(this, extensions)
    return this


Dreamhorn.extend = (extensions) ->
  _.extend(Dreamhorn.prototype, extensions)


Dreamhorn.extend_defaults = (extensions) ->
  _.extend(Dreamhorn.defaults, _.defaultsDeep({}, extensions, Dreamhorn.defaults))

Dreamhorn.defaults =
  deck_type: Deck


module.exports = Dreamhorn
