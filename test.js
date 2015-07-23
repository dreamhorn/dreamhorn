var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var Dreamhorn = require("./lib/dreamhorn");

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
      D.emit('begin');
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
      result.should.be.instanceof(Dreamhorn.Situation);
      result.should.equal(begin);
    });

    it('should retrieve a situation by next after top of stack', function () {
      D.stack.push(begin);
      var result = D.get_situation('-->');
      result.should.be.instanceof(Dreamhorn.Situation);
      result.should.equal(next);
    });

    it('should retrieve a dynamic situation if the situation does not exist', function () {
      D.on('situation:missing', function (data) {
        data.content = "Missing no longer!";
      });
      var result = D.get_situation('doesntexist');
      result.should.be.instanceof(Dreamhorn.Situation);
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

  describe('.Stack', function () {
    var stack;
    var data = {foo: 'bar'};
    var item = {id: 'foo'};

    beforeEach(function() {
      stack = new Dreamhorn.Stack();
    });

    describe('#constructor()', function () {
      it('should set up a zero-length stack', function () {
        stack.length.should.equal(0);
      });
    });

    describe('#push()', function () {
      it('should add an item to the stack', function () {
        stack.push(item);
        stack.length.should.equal(1);
        stack.push('foo');
        stack.length.should.equal(2);
        stack.push('bar');
        stack.length.should.equal(3);
        stack._data.should.contain(item);
      });

      it('should send the "pushed" signal', function () {
        var spy = sinon.spy();
        stack.on('pushed', spy);
        stack.push(item, data);
        spy.calledOnce.should.be.ok;
        spy.calledWith(item, data).should.be.ok;
      });
    });

    describe('#pop()', function () {
      it('should remove an item from the top of the stack', function () {
        stack.push('foo');
        stack.push('bar');
        stack.push(item);
        var result = stack.pop();
        stack.length.should.equal(2);
        result.should.equal(item);
      });

      it('should return undefined when popping from an empty stack', function () {
        var result = stack.pop();
        stack.length.should.equal(0);
        expect(result).to.be.undefined;
      });

      it('should send the "popped" signal', function () {
        var spy = sinon.spy();
        stack.push(item);
        stack.on('popped', spy);
        stack.pop(data);
        spy.calledOnce.should.be.ok;
        spy.calledWith(item, data).should.be.ok;
      });
    });

    describe('#peek()', function () {
      it('should remove an item from the stack', function () {
        stack.push(item);
        var result = stack.peek();
        stack.length.should.equal(1);
        result.should.equal(item);
      });
    });

    describe('#drop()', function () {
      it('should remove an item from the stack', function () {
        stack.push(item);
        var result = stack.drop(item);
        stack.length.should.equal(0);
        result.should.equal(item);
      });

      it('should send the "popped" signal', function () {
        var spy = sinon.spy();
        stack.push(item);
        stack.on('popped', spy);
        stack.pop(data);
        spy.calledOnce.should.be.ok;
        spy.calledWith(item, data).should.be.ok;
      });

      it('should send the "dropped" signal', function () {
        var spy = sinon.spy();
        stack.push(item);
        stack.push(item);
        stack.push(item);
        stack.on('dropped', spy);
        stack.drop(item, data);
        spy.calledOnce.should.be.ok;
        spy.calledWith(item, data).should.be.ok;
      });
    });
  });

  describe('.Dispatcher', function () {
    var dispatcher;

    beforeEach(function() {
      dispatcher = new Dreamhorn.Dispatcher();
    });

    describe('#on() and #emit()', function () {
      it('should set up a listener', function () {
        var spy = sinon.spy();
        dispatcher.on('signal', spy);
        dispatcher.emit('signal', 'foo', 'bar');
        spy.calledOnce.should.be.ok;
        spy.calledWith('foo', 'bar').should.be.ok;
        spy.reset();
        dispatcher.emit('signal', 'baz', 'boo');
        spy.calledOnce.should.be.ok;
        spy.calledWith('baz', 'boo').should.be.ok;
      });
    });

    describe('#once()', function () {
      it('should set up a listener', function () {
        var spy = sinon.spy();
        dispatcher.once('signal', spy);
        dispatcher.emit('signal', 'foo', 'bar');
        spy.calledOnce.should.be.ok;
        spy.calledWith('foo', 'bar').should.be.ok;
        dispatcher.emit('signal', 'baz', 'boo');
        spy.calledOnce.should.be.ok;
        spy.calledWith('foo', 'bar').should.be.ok;
      });
    });
  });

  describe('.Situation', function () {
    var situation;
    var id;
    var data;

    beforeEach(function() {
      id = 'foo';
      data = {content: 'bar'};
    });

    describe('#constructor(id, data)', function () {
      it('should set up with an id and data', function () {
        situation = new Dreamhorn.Situation(id, data);
        situation.id.should.equal(id);
        situation.content.should.equal(data.content);
      });

      it('should set up with only data, with an id', function () {
        data.id = id;
        situation = new Dreamhorn.Situation(data);
        situation.id.should.equal(id);
        situation.content.should.equal(data.content);
      });

      it('should set up with only data, with no id', function () {
        id = md5(JSON.stringify(data));
        situation = new Dreamhorn.Situation(data);
        situation.id.should.equal(id);
        situation.content.should.equal(data.content);
      });

      it('should set up with an id and a content string', function () {
        content = data.content;
        situation = new Dreamhorn.Situation(id, content);
        situation.id.should.equal(id);
        situation.content.should.equal(data.content);
      });

      it('should set up with only a content string, with no id', function () {
        content = data.content;
        id = md5(JSON.stringify(data));
        situation = new Dreamhorn.Situation(content);
        situation.id.should.equal(id);
        situation.content.should.equal(data.content);
      });
    });
  });
});
