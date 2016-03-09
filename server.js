var express = require('express');
var app = express();
var multer = require('multer');
var storage = multer.memoryStorage();
var inMem = multer({storage: storage});

/*
	TODO: Allow multiple file uploads / folder, only keep unique values
	TODO: Front end
	TODO: Save output to file
*/

app.get('/', function (req, res) {
  	res.sendFile(__dirname + '/index.html');
});

app.post('/organize', inMem.array('clippings'), function (req, res) {

	try {

		var tempModel = {};
		var clippings = [];

		req.files.forEach(function(file){

			file.buffer.toString('utf-8').split('\n').forEach(function(line, i, arr){
		  		
		  		try {
		  			
		  			line = line.replace('\r', '');

		  			if (line.indexOf('========') !== -1) {
						
						if (tempModel.text && tempModel.text.trim().split(' ').length === 1)
							tempModel['vocab'] = true;
						else
							tempModel['vocab'] = false;

						if (tempModel.location && tempModel.location.indexOf('-') === -1)
							tempModel['note'] = true;
						else
							tempModel['note'] = false;
						
						if (tempModel.title && tempModel.text)
							clippings.push(tempModel);
						tempModel = {};
			  		
			  		}
			  		else if (!tempModel.title) {
			  			tempModel['title'] = line;
			  		}
			  		else if (!tempModel.location) {
			  			tempModel['location'] = line.split('|')[0].split('Location')[1].trim();
			  			tempModel['date'] = line.split('Added on ')[1];
			  		}
			  		else if (/[a-z]/i.test(line)) {
			  			tempModel['text'] ? tempModel['text'] += line : tempModel['text'] = line;
			  		}
		  		} catch (error) {
		  			console.log(line, tempModel, error);
		  		}
		  		
		  	});

		});

		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(clippings));

	} catch (error) {
		res.send('There was an error reading this file.');
	}

});


app.listen(3000, function () {
  	console.log('App listening on port 3000.');
});

/*

Sample output:

{
	date: 'Nov 3, 1999',
	location: '123-123',
	text: 'scrimscram',
	title: 'Cloud Atlas',
	vocab: true,
	note: false
}

*/



