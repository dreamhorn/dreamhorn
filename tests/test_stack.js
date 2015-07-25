var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var Stack = require("dreamhorn/stack");

var expect = chai.expect;
chai.should();


describe('Stack', function () {
  var stack;
  var data = {foo: 'bar'};
  var item = {id: 'foo'};

  beforeEach(function() {
    stack = new Stack();
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
