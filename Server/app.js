var express 		= require('express'),
	jsdom 			= require('jsdom'),
	request 		= require('request'),
	url 			= require('url'),
	fs 				= require('fs'),
	updateJob 		= require('./js/update.js'),
	analyser 		= require('./js/analyser.js'),
	stockChange 	= require('./js/stockChange.js'),
	app 			= express();

updateJob.attemptUpdate();

setInterval(function() {
	//updateJob.attemptUpdate();
}, 5 * 60 * 1000);

app.listen(3000);

app.get('/palaceItems', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
	res.end(fs.readFileSync('./data/supremeItems.json', 'utf-8'))
});

app.get('/supremeItems', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
	res.end(fs.readFileSync('./data/palaceItems.json', 'utf-8'))
});

app.get('/allItems', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
	res.end(fs.readFileSync('./data/items.json', 'utf-8'))
});

app.get('/events', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
	res.end(fs.readFileSync('./data/events.json', 'utf-8'))
});