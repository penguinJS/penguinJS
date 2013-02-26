var Penguin = require('../Penguin.js');

var assert = require('../components/chai/chai.js').assert;

suite('changeRepeaterItemNamespace', function(){


    test('should exist', function(){
        assert.ok(Penguin.changeRepeaterItemNamespace);
    });

    test('should not change simple strings', function(){

        assert.equal(Penguin.changeRepeaterItemNamespace('foobar'), 'foobar');
    });

    test('should not change simple macros', function(){

        var testList = [
            {start: '[~foo~]', expected: '[~foo~]'},
            {start: '[~foo:switch~]', expected: '[~foo:switch~]'},
            {start: '[~foo#bar:switch~]', expected: '[~foo#bar:switch~]'}
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
            {start: '[~foo~bar~][~different~test~shit~stuff~]', expected:'[~foo#bar~][~different#test~shit~stuff~]'},
            {start: '[~foo~bar:if~]', expected:'[~foo#bar:if~]'}
        ];

        testList.forEach(function(item){

            assert.equal(Penguin.changeRepeaterItemNamespace(item.start), item.expected);

        });


    });

});

suite('definePresetType', function(){

    test('should exist', function(){

        assert.ok(Penguin.definePresetType);
    });

    test('should store presets to be used in templates', function(){

        Penguin.definePresetType('presetTest', 'presetContent');

        assert.equal(Penguin.renderTemplate('[~foo@presetTest~]', {foo:''}), 'presetContent');
    });
});