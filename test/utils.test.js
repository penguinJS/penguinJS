var Penguin = require('../Penguin.js');

var assert = require('../components/chai/chai.js').assert;

suite('changeRepeaterItemNamespace', function(){

    test('should not change simple strings', function(){

        assert.equal(Penguin.changeRepeaterItemNamespace('foobar'), 'foobar');
    });

    test('should not change simple macros', function(){

        var testList = [
            {start: '[~foo~]', expected: '[~foo~]'},
            {start: '[~foo:switch~]', expected: '[~foo:switch~]'}
        ];

        testList.forEach(function(item){

            assert.equal(Penguin.changeRepeaterItemNamespace(item.start), item.expected);

        });

    });

    test('should change any string with [~foo~bar~] to [~foo#bar~]', function(){

        var testList = [
            {start: '[~foo~bar~]', expected: '[~foo#bar~]'},
            {start: '[~foo~bar~][~foo~bar~]', expected: '[~foo#bar~][~foo#bar~]'},
            {start: '[~foo~bar~][~different~test~]', expected:'[~foo#bar~][~different#test~]'},
            {start: '[~foo~bar~][~different~test~shit~]', expected:'[~foo#bar~][~different#test~shit~]'},
            {start: '[~foo~bar~][~different#test~shit~]', expected:'[~foo#bar~][~different#test#shit~]'},
            {start: '[~foo~bar:if~]', expected:'[~foo#bar:if~]'}
        ];

        testList.forEach(function(item){

            assert.equal(Penguin.changeRepeaterItemNamespace(item.start), item.expected);

        });


    });

});