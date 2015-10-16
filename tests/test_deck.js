var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var Deck = require("../deck");
var Card = require("../card");
var When = require("When");

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
        begin_card: Deck.defaults.begin_card,
        default_action: 'push'
      });
    });

    it('should set up options, overriding defaults', function () {
      options.begin_card = 'blah';
      D = new Deck(options);
      D.options.should.deep.equal({
        foo: 'bar',
        begin_card: 'blah',
        default_action: 'push'
      });
    });
  });

  describe('events', function () {
    it('should begin on the begin event', function () {
      D.card('begin', "Begun!");
      D.stack.length.should.equal(0);
      D.will_trigger('begin').then(function () {
        D.stack.length.should.equal(1);
        D.stack.peek().should.deep.equal({
          id: 'begin',
          content: 'Begun!',
          index: 0,
          default_action: 'push'
        });
      });
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

  describe('#will_get_card()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should retrieve a card by id', function () {
      D.will_get_card('begin').then(function (result) {
        result.should.be.instanceof(Card);
        result.should.equal(begin);
      });
    });

    it('should retrieve a card by next after top of stack', function () {
      D.stack.will_push(begin).then(function () {
        D.will_get_card('-->').then(function (result) {
          result.should.be.instanceof(Card);
          result.should.equal(next);
        });
      });
    });

    it('should retrieve a dynamic card if the card does not exist', function () {
      D.on('card:missing', function (data) {
        data.content = "Missing no longer!";
      });
      D.will_get_card('doesntexist').then(function (result) {
        result.should.be.instanceof(Card);
        result.content.should.equal("Missing no longer!");
      });
    });

    it('should throw an error if the card does not exist', function () {
      (function () {
        D.will_get_card('doesntexist').reject(function (error) {
          error.should.equal("No such card doesntexist")
        })
      })
    });
  });

  describe('#will_push()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should push a card by data onto the stack', function () {
      D.will_push({target: 'begin'}).then(function () {
        D.stack.length.should.equal(1);
        D.stack.peek().should.equal(begin);
      });
    });

    it('should push a card by id onto the stack', function () {
      D.will_push('begin').then(function () {
        D.stack.length.should.equal(1);
        D.stack.peek().should.equal(begin);
      });
    });

    it('should send the data with the push', function () {
      var spy = sinon.spy();
      D.stack.on('pushed', spy);
      var data = {target: 'begin'};
      D.will_push({target: 'begin'}).then(function (card) {
        spy.calledOnce.should.be.ok;
        spy.calledWith(card, data).should.be.ok;
      });
    });
  });

  describe('#will_pop()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should pop a card off the stack', function () {
      D.will_push('begin').then(function () {
        D.pop().then(function () {
          D.stack.length.should.equal(0);
        });
      });
    });

    it('should send the data with the pop', function () {
      var spy = sinon.spy();
      D.stack.on('popped', spy);
      D.will_push('begin').then(function () {
        var data = {foo: 'bar'};
        D.will_pop(data).then(function () {
          spy.calledOnce.should.be.ok;
          spy.calledWith(begin, data).should.be.ok;
        });
      });
    });
  });

  describe('#will_replace()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should replace a card onto the stack', function () {
      D.will_push('begin').then(function () {
        D.will_replace({target: 'next'}).then(function () {
          D.stack.length.should.equal(1);
          D.stack.peek().should.equal(next);
        });
      });
    });

    it('should send the data with the replace', function () {
      D.will_push('begin').then(function () {
        var push_spy = sinon.spy();
        var pop_spy = sinon.spy();
        D.stack.on('pushed', push_spy);
        D.stack.on('popped', pop_spy);
        var data = {target: 'next'};
        D.will_replace(data).then(function () {
          pop_spy.calledOnce.should.be.ok;
          pop_spy.calledWith(begin, data).should.be.ok;
          push_spy.calledOnce.should.be.ok;
          push_spy.calledWith(next, data).should.be.ok;
        });
      });
    });
  });

  describe('#will_drop()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should drop a card off the stack', function () {
      return When.all(
        D.will_push('begin'),
        D.will_push('next')
      ).then(function () {
        D.will_drop({from_card: begin}).then(function () {
          D.stack.length.should.equal(1);
          D.stack.peek().should.equal(next);
        })
      })
    });

    it('should drop multiple occurrences of a card off the stack', function () {
      return When.all(
        D.will_push('begin'),
        D.will_push('begin'),
        D.will_push('next')
      ).then(function () {
        return D.will_drop({from_card: begin}).then(function () {
          D.stack.length.should.equal(1);
          D.stack.peek().should.equal(next);
        });
      });
    });

    it('should send the data with the drop', function () {
      var spy = sinon.spy();
      D.stack.on('dropped', spy);
      return When.all(
        D.will_push('begin'),
        D.will_push('next')
      ).then(function () {
        var data = {from_card: begin};
        return D.will_drop(data).then(function () {
          spy.calledOnce.should.be.ok;
          spy.firstCall.args[0].id.should.equal('begin');
          spy.firstCall.args[1].should.equal(data);
        });
      });
    });
  });

  describe('#will_clear()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.card('begin', 'Begun!');
      next = D.card('next', 'Next!');
    });

    it('should clear the stack and push a new card', function () {
      return D.will_push('begin').then(function () {
        return D.will_clear({target: 'next'}).then(function () {
          D.stack.length.should.equal(1);
          D.stack.peek().should.equal(next);
        });
      });
    });

    it('should send the data with the clear and the popped', function () {
      return D.will_push('begin').then(function () {
        var clear_spy = sinon.spy();
        var push_spy = sinon.spy();
        D.stack.on('cleared', clear_spy);
        D.stack.on('pushed', push_spy);
        var data = {target: 'next'};
        return D.will_clear(data).then(function () {
          clear_spy.calledOnce.should.be.ok;
          clear_spy.firstCall.args[0][0].id.should.equal('begin');
          clear_spy.firstCall.args[1].should.equal(data);
          push_spy.calledOnce.should.be.ok;
          push_spy.firstCall.args[0].id.should.equal('next');
          push_spy.firstCall.args[1].should.equal(data);
        });
      });
    });
  });
});
