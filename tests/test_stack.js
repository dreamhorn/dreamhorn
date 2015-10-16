var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var Stack = require("../stack");

var expect = chai.expect;
chai.should();

var When = require('when');


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

  describe('#will_push()', function () {
    it('should add an item to the stack', function () {
      return stack.will_push(item).then(function () {
        stack.length.should.equal(1);
      }).then(function () {
        return stack.will_push('foo');
      }).then(function () {
        stack.length.should.equal(2);
      }).then(function () {
        return stack.will_push('bar').then(function () {
          stack.length.should.equal(3);
        });
      }).then(function () {
        stack._data.should.contain(item);
      });
    });

    it('should send the "pushed" signal', function () {
      var spy = sinon.spy();
      stack.on('pushed', spy);
      return stack.will_push(item, data).then(function () {
        spy.calledOnce.should.be.ok;
        spy.calledWith(item, data).should.be.ok;
      });
    });
  });

  describe('#will_pop()', function () {
    it('should remove an item from the top of the stack', function () {
      return When(
        stack.will_push('foo'),
        stack.will_push('bar'),
        stack.will_push(item)
      ).then(function () {
        return stack.will_pop(data).then(function (result) {
          stack.length.should.equal(2);
          result.should.deep.equal([item, data]);
        });
      })
    });

    it('should return undefined when popping from an empty stack', function () {
      return stack.will_pop().otherwise(function (result) {
        stack.length.should.equal(0);
        expect(result).to.be.an.instanceof(Error);
      });
    });

    it('should send the "popped" signal', function () {
      var spy = sinon.spy();
      return stack.will_push(item).then(function () {
        stack.on('popped', spy);
        return stack.will_pop(data).then(function () {
          spy.calledOnce.should.be.ok;
          spy.calledWith(item, data).should.be.ok;
        });
      });
    });
  });

  describe('#peek()', function () {
    it('should remove an item from the stack', function () {
      return stack.will_push(item).then(function () {
        var result = stack.peek();
        stack.length.should.equal(1);
        result.should.equal(item);
      });
    });
  });

  describe('#will_drop()', function () {
    it('should remove an item from the stack', function () {
      return stack.will_push(item).then(function () {
        return stack.will_drop(item, data).then(function (result) {
          stack.length.should.equal(0);
          result.should.deep.equal([item, data]);
        });
      });
    });

    it('should send the "popped" signal', function () {
      var spy = sinon.spy();
      return stack.will_push(item).then(function () {
        stack.on('popped', spy);
        return stack.will_pop(data).then(function () {
          spy.calledOnce.should.be.ok;
          spy.calledWith(item, data).should.be.ok;
        });
      });
    });

    it('should send the "dropped" signal', function () {
      var spy = sinon.spy();
      return When.all(
        stack.will_push(item),
        stack.will_push(item),
        stack.will_push(item)
      ).then(function () {
        stack.on('dropped', spy);
        return stack.will_drop(item, data).then(function () {
          spy.calledOnce.should.be.ok;
          spy.calledWith(item, data).should.be.ok;
        });
      })
    });
  });
});
