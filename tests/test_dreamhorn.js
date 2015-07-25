var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var Dreamhorn = require("dreamhorn");
var Situation = require("dreamhorn/situation");

var expect = chai.expect;
chai.should();

describe('Dreamhorn', function () {
  var D;
  var options;

  beforeEach(function() {
    options = {
      foo: "bar"
    };
    D = new Dreamhorn(options);
  });

  describe('#constructor()', function () {
    it('should set up options', function () {
      D.options.should.deep.equal({
        foo: 'bar',
        begin_situation: Dreamhorn.defaults.begin_situation
      });
    });

    it('should set up options, overriding defaults', function () {
      options.begin_situation = 'blah';
      D = new Dreamhorn(options);
      D.options.should.deep.equal({
        foo: 'bar',
        begin_situation: 'blah'
      });
    });
  });

  describe('events', function () {
    it('should begin on the begin event', function () {
      D.situation('begin', "Begun!");
      D.stack.length.should.equal(0);
      D.trigger('begin');
      D.stack.length.should.equal(1);
      D.stack.peek().should.deep.equal({id: 'begin', content: 'Begun!', index: 0});
    });
  });

  describe('#situation()', function () {
    it('should add a new situation by id and data', function () {
      D.situation('begin', 'Begun!');
      D.situations_by_id.has('begin').should.be.ok;
      D.situations_in_order.length.should.equal(1);
      var situation = D.situations_by_id.get('begin');
      situation.index.should.equal(0);
      situation.content.should.equal('Begun!');
    });
  });

  describe('#get_situation()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.situation('begin', 'Begun!');
      next = D.situation('next', 'Next!');
    });

    it('should retrieve a situation by id', function () {
      var result = D.get_situation('begin');
      result.should.be.instanceof(Situation);
      result.should.equal(begin);
    });

    it('should retrieve a situation by next after top of stack', function () {
      D.stack.push(begin);
      var result = D.get_situation('-->');
      result.should.be.instanceof(Situation);
      result.should.equal(next);
    });

    it('should retrieve a dynamic situation if the situation does not exist', function () {
      D.on('situation:missing', function (data) {
        data.content = "Missing no longer!";
      });
      var result = D.get_situation('doesntexist');
      result.should.be.instanceof(Situation);
      result.content.should.equal("Missing no longer!");
    });

    it('should throw an error if the situation does not exist', function () {
      (function () {
        D.get_situation('doesntexist')
      }).should.throw("No such situation doesntexist");
    });
  });

  describe('#push()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.situation('begin', 'Begun!');
      next = D.situation('next', 'Next!');
    });

    it('should push a situation by data onto the stack', function () {
      D.push({target: 'begin'});
      D.stack.length.should.equal(1);
      D.stack.peek().should.equal(begin);
    });

    it('should push a situation by id onto the stack', function () {
      D.push('begin');
      D.stack.length.should.equal(1);
      D.stack.peek().should.equal(begin);
    });

    it('should send the data with the push', function () {
      var spy = sinon.spy();
      D.stack.on('pushed', spy);
      var data = {target: 'begin'};
      var situation = D.push({target: 'begin'});
      spy.calledOnce.should.be.ok;
      spy.calledWith(situation, data).should.be.ok;
    });
  });

  describe('#pop()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.situation('begin', 'Begun!');
      next = D.situation('next', 'Next!');
    });

    it('should pop a situation off the stack', function () {
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
      begin = D.situation('begin', 'Begun!');
      next = D.situation('next', 'Next!');
    });

    it('should replace a situation onto the stack', function () {
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
      begin = D.situation('begin', 'Begun!');
      next = D.situation('next', 'Next!');
    });

    it('should drop a situation off the stack', function () {
      D.push('begin');
      D.push('next');
      D.drop({from_situation: begin});
      D.stack.length.should.equal(1);
      D.stack.peek().should.equal(next);
    });

    it('should drop multiple occurrences of a situation off the stack', function () {
      D.push('begin');
      D.push('begin');
      D.push('next');
      D.drop({from_situation: begin});
      D.stack.length.should.equal(1);
      D.stack.peek().should.equal(next);
    });

    it('should send the data with the drop', function () {
      var spy = sinon.spy();
      D.stack.on('dropped', spy);
      D.push('begin');
      D.push('next');
      var data = {from_situation: begin};
      D.drop(data);
      spy.calledOnce.should.be.ok;
      spy.calledWith(begin, data).should.be.ok;
    });
  });

  describe('#clear()', function () {
    var begin, next;

    beforeEach(function() {
      begin = D.situation('begin', 'Begun!');
      next = D.situation('next', 'Next!');
    });

    it('should clear stack and push a new situation', function () {
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
