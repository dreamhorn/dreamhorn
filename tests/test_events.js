var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var Events = require("dreamhorn/events");

var expect = chai.expect;
chai.should();


describe('Events', function () {
  var events;

  beforeEach(function() {
    events = new Events();
  });

  describe('#on() and #trigger()', function () {
    it('should set up a listener', function () {
      var spy = sinon.spy();
      events.on('signal', spy);
      events.trigger('signal', 'foo', 'bar');
      spy.calledOnce.should.be.ok;
      spy.calledWith('foo', 'bar').should.be.ok;
      spy.reset();
      events.trigger('signal', 'baz', 'boo');
      spy.calledOnce.should.be.ok;
      spy.calledWith('baz', 'boo').should.be.ok;
    });
  });

  describe('#once()', function () {
    it('should set up a listener', function () {
      var spy = sinon.spy();
      events.once('signal', spy);
      events.trigger('signal', 'foo', 'bar');
      spy.calledOnce.should.be.ok;
      spy.calledWith('foo', 'bar').should.be.ok;
      events.trigger('signal', 'baz', 'boo');
      spy.calledOnce.should.be.ok;
      spy.calledWith('foo', 'bar').should.be.ok;
    });
  });
});
