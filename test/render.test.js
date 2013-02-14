var assert = require('./components/chai/chai.js').assert;

var Penguin = require('../Penguin.js');


suite('renderTemplate', function(){

	test('should exist', function(){
		assert.ok(Penguin.renderTemplate);
	});

	test('should return a string with no Penguin macros', function(){
		var markupList = [
			'test',
			'<div>content</div>',
			'"!*(")~@!',
			'[~~]'
		];

		markupList.forEach(function(x){

			assert.equal(Penguin.renderTemplate(x), x);
		});
		
	});

	test('should replace a macro with the corresponding property value', function(){

		var config = {
			foo: 'bar'
		};

		var markup = '[~foo~]';

		assert.equal(Penguin.renderTemplate(markup, config), config.foo);

		config = {
			'foo bar':'foobar'
		}

		markup = '[~foo bar~]';
		assert.equal(Penguin.renderTemplate(markup, config), config['foo bar']);

	});

	test('should include content between "if" macros where the property resolves to true', function(){

		var config = {
			foo:true
		};

		var markup = '[~foo:if~]bar[/~foo:if~]';
		assert.equal(Penguin.renderTemplate(markup, config), 'bar');
	});

	test('should not include content between "if" macros where the property resolves to false or does not exist	', function(){
		var config = {
			foo: false
		};
		var markup = '[~foo:if~]bar[/~foo:if~]';
		assert.equal(Penguin.renderTemplate(markup, config), '');
		assert.equal(Penguin.renderTemplate(markup, {}), '');
	});

	test('should return repeated content within a "repeater" based on properties within an array', function(){

		var config = {
			people: [
				{name: 'Ben', 'favourite animal': 'gibbon'},
				{name: 'Elliot', 'favourite animal': 'blobfish'},
				{name: 'Marcell', 'favourite animal': 'dog'},
				{name: 'Dan', 'favourite animal': 'dog'},
				{name: 'Tom', 'favourite animal': 'snow leopard'},
				{name: 'Dave', 'favourite animal': 'slender norris'}
			]
		};

		var markup = '[~people:repeater~]<li>[~people~name~] likes the [~people~favourite animal~]</li>[/~people:repeater~]';

		var result = '<li>Ben likes the gibbon</li><li>Elliot likes the blobfish</li><li>Marcell likes the dog</li><li>Dan likes the dog</li><li>Tom likes the snow leopard</li><li>Dave likes the slender norris</li>';

		assert.equal(Penguin.renderTemplate(markup, config), result);

	});

	test('should return switch content according to the appropriate property matching the correct case', function(){

		var config = {
			best: 'ben'
		};

		var markup = '[~best:switch~][~=ben~]Ben[/~=ben~][~=elliot~]Elliot[/~=ben~][~=marcell~]Marcell[/~=marcell~][/~best:switch~] is the best JavaScript developer';

		assert.equal(Penguin.renderTemplate(markup, config), 'Ben is the best JavaScript developer');

	});

	test('should handle "if" nested in "repeater"', function(){

		var config = {
			memberList: [
				{name: 'Ben', JavaScript: true},
				{name: 'Dave', JavaScript: false},
				{name: 'Tom', JavaScript:false},
				{name: 'Marcell', JavaScript:true}
			]
		};

		var markup = 'JavaScript Devs:<ul>[~memberList:repeater~][~memberList~JavaScript:if~]<li>[~memberList~name~]</li>[/~memberList~JavaScript:if~][/~memberList:repeater~]</ul>';

		var result = 'JavaScript Devs:<ul><li>Ben</li><li>Marcell</li></ul>';

		assert.equal(Penguin.renderTemplate(markup, config), result);

	});
});