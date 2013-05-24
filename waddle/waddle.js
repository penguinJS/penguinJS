// Waddle by PenguinJS
// Compile Segments to preload

var fs = require('fs');

var path = require('path');

var waddle = null;

var domain = null;


try{
	domain = require('domain');
}catch(er){

}

outputIntro();

if(typeof domain !== 'undefined'){

	waddle = domain.create();
	waddle.on('error', function(err){
		console.error('Error', err);
	});

	waddle.run(application);

}else{

	process.on('uncaughtException', function(err){
		console.error(err);
	});
	application();

}

function application(){

	var amdFormat = false;

	/** @type {String} path for folder containing segments */
	var targetFolder = process.argv[process.argv.length - 1] || '.';

	/** @type {String} path for filename to write to */
	var output = '';

	process.argv.forEach(function(val, index, array){

		switch(val){

			case '-o':

				if(typeof array[index+1] !== 'undefined'){

					output = array[index+1];
				}else{

					throw Error('No output file defined');
				}
				break;

			case '-amd':

				amdFormat = true;

				break;

			case '-help':
			case '-h':
				outputHelp();
				process.exit();
				break;
		}

	});

	console.log('compiling files in '+ targetFolder + '. outputting to ' + output);


	var outputString = readDirectory(targetFolder);

if(amdFormat){

	// wrap all in define([])
	outputString = 'define([\'penguin\'], function(Penguin){' + outputString + '});';
}

	fs.writeFileSync(output, outputString);
	console.log('\n'+output + ' complete at ' + new Date());
}

function outputIntro(){

console.log('\nwaddle by PenguinJS...\n');

}

function outputHelp(){

}

function processFile(val, index, array, targetFolder, pre){

	var target = path.join(targetFolder, val);

	var stat = fs.statSync(target);

	if(stat.isFile()){

		console.log('File '+ (index + 1) +' of '+array.length+': '+ pre + val);

		var fileContent = fs.readFileSync(target, 'utf8');

		fileContent = fileContent.trim();

		// remove unnecessary whitespace
		fileContent = fileContent.replace(/\s\s+/gm, ' ');
		fileContent = fileContent.replace(/[\r\n]/gm, '');

		/*
		 * escape quotes and <>
		 * " = \u0022
		 * ' = \u0027
		 * < = \u003C
		 * > = \u003E
		 */

		fileContent = fileContent.replace(/"/gm, '\\u0022');
		fileContent = fileContent.replace(/'/gm, '\\u0027');
		fileContent = fileContent.replace(/</gm, '\\u003C');
		fileContent = fileContent.replace(/>/gim, '\\u003E');

		// wrap in outputJS

		/*

			Penguin.cache['val'] = 'fileContent';

		*/

		console.log('...complete');

		return 'Penguin.cache[\''+pre+val+'\'] = \''+fileContent+'\';';


	} else if (stat.isDirectory()) {

		return readDirectory(target, pre + val);

	}

}

function readDirectory(targetFolder, prefix){

	console.log('reading dir : '+ targetFolder);
	var pre = (prefix && prefix + '/') || '';
	var outputString = '';

	var files = fs.readdirSync(targetFolder);

		files.forEach(function(val, index, array){
			var singleOutput = processFile(val, index, array, targetFolder, pre);

			outputString += singleOutput;

	});

	return outputString;
}