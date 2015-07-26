var chai = require('chai');
var sinon = require('sinon');
var md5 = require('md5');
require('blanket');
var Card = require("../card");

var expect = chai.expect;
chai.should();


describe('Card', function () {
  var card;
  var id;
  var data;

  beforeEach(function() {
    id = 'foo';
    data = {content: 'bar'};
  });

  describe('#constructor(id, data)', function () {
    it('should set up with an id and data', function () {
      card = new Card(id, data);
      card.id.should.equal(id);
      card.content.should.equal(data.content);
    });

    it('should set up with only data, with an id', function () {
      data.id = id;
      card = new Card(data);
      card.id.should.equal(id);
      card.content.should.equal(data.content);
    });

    it('should set up with only data, with no id', function () {
      id = md5(JSON.stringify(data));
      card = new Card(data);
      card.id.should.equal(id);
      card.content.should.equal(data.content);
    });

    it('should set up with an id and a content string', function () {
      content = data.content;
      card = new Card(id, content);
      card.id.should.equal(id);
      card.content.should.equal(data.content);
    });

    it('should set up with only a content string, with no id', function () {
      content = data.content;
      id = md5(JSON.stringify(data));
      card = new Card(content);
      card.id.should.equal(id);
      card.content.should.equal(data.content);
    });
  });
});
