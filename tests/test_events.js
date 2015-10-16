var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var Events = require("../events");

var expect = chai.expect;
chai.should();


describe('Events', function () {
  var events;

  beforeEach(function() {
    events = new Events();
  });

  describe('#on() and #will_trigger()', function () {
    it('should set up a listener', function () {
      var spy = sinon.spy();
      events.on('signal', spy);
      return events.will_trigger('signal', 'foo', 'bar').then(function () {
        spy.calledOnce.should.be.ok;
        spy.calledWith('foo', 'bar').should.be.ok;
        spy.reset();
        return events.will_trigger('signal', 'baz', 'boo').then(function () {
          spy.calledOnce.should.be.ok;
          spy.calledWith('baz', 'boo').should.be.ok;
        });
      });
    });
  });

  describe('#once()', function () {
    it('should set up a listener', function () {
      var spy = sinon.spy();
      events.once('signal', spy);
      return events.will_trigger('signal', 'foo', 'bar').then(function () {
        spy.calledOnce.should.be.ok;
        spy.calledWith('foo', 'bar').should.be.ok;
        return events.will_trigger('signal', 'baz', 'boo').then(function () {
          spy.calledOnce.should.be.ok;
          spy.calledWith('foo', 'bar').should.be.ok;
        });
      });
    });
  });
});
