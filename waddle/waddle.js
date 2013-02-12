// Waddle by PenguinJS
// Compile Segments to preload


var fs = require('fs');
var path = require('path');

/** @type {String} path for folder containing segments */
var targetFolder = process.argv[process.argv.length - 1] || '.';

/** @type {String} path for filename to write to */
var output = '';

/** @type {Boolean} flag to determine whether to wrap the output as amd */
var amdFormat = false;

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
	}

});


fs.readdir(targetFolder, function(err, files){

	var outputString = '';
	
	files.forEach(function(val, index, array){

		var target = path.join(targetFolder, val);

		var stat = fs.statSync(target);

		if(stat.isFile()){

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

			outputString += 'Penguin.cache[\''+val+'\'] = \''+fileContent+'\';';

		}


	});

	if(amdFormat){

		// wrap all in define([])
		outputString = 'define([\'penguin\'], function(Penguin){' + outputString + '});';
	}

	fs.writeFile(output, outputString);
});