var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var Situation = require("../situation");

var expect = chai.expect;
chai.should();


describe('Situation', function () {
  var situation;
  var id;
  var data;

  beforeEach(function() {
    id = 'foo';
    data = {content: 'bar'};
  });

  describe('#constructor(id, data)', function () {
    it('should set up with an id and data', function () {
      situation = new Situation(id, data);
      situation.id.should.equal(id);
      situation.content.should.equal(data.content);
    });

    it('should set up with only data, with an id', function () {
      data.id = id;
      situation = new Situation(data);
      situation.id.should.equal(id);
      situation.content.should.equal(data.content);
    });

    it('should set up with only data, with no id', function () {
      id = md5(JSON.stringify(data));
      situation = new Situation(data);
      situation.id.should.equal(id);
      situation.content.should.equal(data.content);
    });

    it('should set up with an id and a content string', function () {
      content = data.content;
      situation = new Situation(id, content);
      situation.id.should.equal(id);
      situation.content.should.equal(data.content);
    });

    it('should set up with only a content string, with no id', function () {
      content = data.content;
      id = md5(JSON.stringify(data));
      situation = new Situation(content);
      situation.id.should.equal(id);
      situation.content.should.equal(data.content);
    });
  });
});
