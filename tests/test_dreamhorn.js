var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var _ = require('lodash');
var Dreamhorn = require("../dreamhorn");
var Situation = require("../situation");
var Deck = require('../deck');

var expect = chai.expect;
chai.should();

describe('Dreamhorn', function () {
  var D;
  var options;
  var orig_defaults = _.cloneDeep(Dreamhorn.defaults);

  afterEach(function () {
    Dreamhorn.defaults = _.cloneDeep(orig_defaults);
  });

  describe('.extend()', function () {
    it('should extend the core Dreamhorn object', function () {
      Dreamhorn.extend({
        foo: 'bar'
      });
      Dreamhorn.prototype.foo.should.equal('bar');
    });
  });

  describe('.extend_defaults()', function () {
    it('should extend the core Dreamhorn defaults object', function () {
      Dreamhorn.extend_defaults({
        foo: 'bar'
      });
      Dreamhorn.defaults.should.deep.equal({
        deck_type: Deck,
        foo: 'bar',
        main_deck: 'main'
      });
      Dreamhorn.extend_defaults({
        foo: 'blah',
        bar: {baz: 'boo'},
        main_deck: 'main'
      });
      Dreamhorn.defaults.should.deep.equal({
        deck_type: Deck,
        foo: 'blah',
        bar: {baz: 'boo'},
        main_deck: 'main'
      });
      Dreamhorn.extend_defaults({
        bar: {blah: 'barf'}
      });
      Dreamhorn.defaults.should.deep.equal({
        deck_type: Deck,
        foo: 'blah',
        bar: {baz: 'boo', blah: 'barf'},
        main_deck: 'main'
      });
    });
  });

  describe('#constructor()', function () {
    var options, D;

    beforeEach(function() {
      options = {
        foo: "bar"
      };
      D = new Dreamhorn(options);
    });

    it('should set up options', function () {
      D.options.should.deep.equal({
        foo: 'bar',
        deck_type: Deck,
        main_deck: 'main'
      });
    });

    it('should set up options, overriding defaults', function () {
      options.deck_type = function () {};
      D = new Dreamhorn(options);
      D.options.should.deep.equal({
        foo: 'bar',
        deck_type: options.deck_type,
        main_deck: 'main'
      });
    });
  });
});
