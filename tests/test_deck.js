var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var Deck = require("../deck");
var Card = require("../card");

var expect = chai.expect;
chai.should();

describe('Deck', function () {
  var D;
  var options;

  beforeEach(function() {
    options = {
      foo: "bar"
    };
    D = new Deck(options);
  });

  describe('#constructor()', function () {
    it('should set up options', function () {
      D.options.should.deep.equal({
        foo: 'bar',
        begin_card: Deck.defaults.begin_card
      });
    });

    it('should set up options, overriding defaults', function () {
      options.begin_card = 'blah';
      D = new Deck(options);
      D.options.should.deep.equal({
        foo: 'bar',
        begin_card: 'blah'
      });
    });
  });

  describe('events', function () {
    it('should begin on the begin event', function () {
      D.card('begin', "Begun!");
      D.stack.length.should.equal(0);
      D.trigger('begin');
      D.stack.length.should.equal(1);
      D.stack.peek().should.deep.equal({id: 'begin', content: 'Begun!', index: 0});
    });
  });

  describe('#card()', function () {
    it('should add a new card by id and data', function () {
      D.card('begin', 'Begun!');
      D.cards_by_id.has('begin').should.be.ok;
      D.cards_in_order.length.should.equal(1);
      var card = D.cards_by_id.get('begin');
      card.index.should.equal(0);
      card.content.should.equal('Begun!');
    });
  });

  describe('#get_card()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should retrieve a card by id', function () {
      var result = D.get_card('begin');
      result.should.be.instanceof(Card);
      result.should.equal(begin);
    });

    it('should retrieve a card by next after top of stack', function () {
      D.stack.push(begin);
      var result = D.get_card('-->');
      result.should.be.instanceof(Card);
      result.should.equal(next);
    });

    it('should retrieve a dynamic card if the card does not exist', function () {
      D.on('card:missing', function (data) {
        data.content = "Missing no longer!";
      });
      var result = D.get_card('doesntexist');
      result.should.be.instanceof(Card);
      result.content.should.equal("Missing no longer!");
    });

    it('should throw an error if the card does not exist', function () {
      (function () {
        D.get_card('doesntexist')
      }).should.throw("No such card doesntexist");
    });
  });

  describe('#push()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should push a card by data onto the stack', function () {
      D.push({target: 'begin'});
      D.stack.length.should.equal(1);
      D.stack.peek().should.equal(begin);
    });

    it('should push a card by id onto the stack', function () {
      D.push('begin');
      D.stack.length.should.equal(1);
      D.stack.peek().should.equal(begin);
    });

    it('should send the data with the push', function () {
      var spy = sinon.spy();
      D.stack.on('pushed', spy);
      var data = {target: 'begin'};
      var card = D.push({target: 'begin'});
      spy.calledOnce.should.be.ok;
      spy.calledWith(card, data).should.be.ok;
    });
  });

  describe('#pop()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should pop a card off the stack', function () {
      D.push('begin');
      D.pop();
      D.stack.length.should.equal(0);
    });

    it('should send the data with the pop', function () {
      var spy = sinon.spy();
      D.stack.on('popped', spy);
      D.push('begin');
      var data = {foo: 'bar'};
      D.pop(data);
      spy.calledOnce.should.be.ok;
      spy.calledWith(begin, data).should.be.ok;
    });
  });

  describe('#replace()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should replace a card onto the stack', function () {
      D.push('begin');
      D.replace({target: 'next'});
      D.stack.length.should.equal(1);
      D.stack.peek().should.equal(next);
    });

    it('should send the data with the replace', function () {
      D.push('begin');
      var push_spy = sinon.spy();
      var pop_spy = sinon.spy();
      D.stack.on('pushed', push_spy);
      D.stack.on('popped', pop_spy);
      var data = {target: 'next'};
      D.replace(data);
      pop_spy.calledOnce.should.be.ok;
      pop_spy.calledWith(begin, data).should.be.ok;
      push_spy.calledOnce.should.be.ok;
      push_spy.calledWith(next, data).should.be.ok;
    });
  });

  describe('#drop()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should drop a card off the stack', function () {
      D.push('begin');
      D.push('next');
      D.drop({from_card: begin});
      D.stack.length.should.equal(1);
      D.stack.peek().should.equal(next);
    });

    it('should drop multiple occurrences of a card off the stack', function () {
      D.push('begin');
      D.push('begin');
      D.push('next');
      D.drop({from_card: begin});
      D.stack.length.should.equal(1);
      D.stack.peek().should.equal(next);
    });

    it('should send the data with the drop', function () {
      var spy = sinon.spy();
      D.stack.on('dropped', spy);
      D.push('begin');
      D.push('next');
      var data = {from_card: begin};
      D.drop(data);
      spy.calledOnce.should.be.ok;
      spy.calledWith(begin, data).should.be.ok;
    });
  });

  describe('#clear()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should clear stack and push a new card', function () {
      D.push('begin');
      D.clear({target: 'next'});
      D.stack.length.should.equal(1);
      D.stack.peek().should.equal(next);
    });

    it('should send the data with the clear and the popped', function () {
      D.push('begin');
      var clear_spy = sinon.spy();
      var push_spy = sinon.spy();
      D.stack.on('cleared', clear_spy);
      D.stack.on('pushed', push_spy);
      var data = {target: 'next'};
      D.clear(data);
      clear_spy.calledOnce.should.be.ok;
      clear_spy.calledWith(data).should.be.ok;
      push_spy.calledOnce.should.be.ok;
      push_spy.calledWith(next, data).should.be.ok;
    });
  });
});
