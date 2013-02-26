var assert = require('../components/chai/chai.js').assert;

var sinon = require('../components/sinon');

var Penguin = require('../Penguin.js');

suite('getMarkup', function(){

	setup(function(){

		Penguin.cache = {};

	});

	test('should exist', function(){
		assert.ok(Penguin.getMarkup);
	});

	test('should error when no callback is provided and a template is not cached', function(){

		assert.throws(function(){Penguin.getMarkup('test.html', {})}, Error);

	});

	test('should return parsed string when template is cached and no callback is provided', function(){

		Penguin.cache['test.html'] = 'Hello my name is [~name~]';

		var config = {
			name: 'Clarkington Charlesworthy'
		};

		assert.equal(Penguin.getMarkup('test.html', config), 'Hello my name is Clarkington Charlesworthy');

	});

	test('should pass parsed template to callback function', function(done){

		var stub = sinon.stub(Penguin, 'ajax');

		stub.callsArgWith(1, 'Hello my name is [~name~]');

		var config = {
		 	name: 'Clarkington Charlesworthy'
		};

		Penguin.getMarkup('test.html', config, function(data){
			assert.equal(data, 'Hello my name is Clarkington Charlesworthy');
			done();
			stub.restore();
		});
	});

});