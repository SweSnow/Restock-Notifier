var express 		= require('express'),
	jsdom 			= require('jsdom'),
	request 		= require('request'),
	url 			= require('url'),
	fs 				= require('fs'),
	updateJob 		= require('./js/update.js'),
	analyser 		= require('./js/analyser.js'),
	stockChange 	= require('./js/stockChange.js'),
	app 			= express();

app.use(express.static('public'));

updateJob.attemptUpdate();

setInterval(function() {
	//updateJob.attemptUpdate();
}, 5 * 60 * 1000);

app.listen(3000);

// var fileMap = {
// 	'supreme': '/data/supremeItems.json',
// 	'palace': '/data/palaceItems.json',
// };
// app.get('/items/:store', function(req, res) {
// 	var store = req.params.store;
// 	res.sendFile(__dirname + fileMap[store]);
// });
// app.get('/items', function(req, res) {
// 	res.sendFile(__dirname + '/data/items.json');
// });

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

app.get('/resetEventsAndItems', function(req, res) {
	fs.writeFileSync('./data/items.json', JSON.stringify([{"updateTime":0,"brand":"Palace","items":[]}, {"updateTime":0,"brand":"Supreme","items":[]}], 'utf-8'));
	fs.writeFileSync('./data/events.json', JSON.stringify({"updateTime":0,"events":[]}, 'utf-8'));

	res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
	res.end('Deleted');
});

app.get('/forceRefreshItems', function(req, res) {
	updateJob.runFullUpdate(function() {
		analyser.analyse();
		res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
		res.end('Refreshed');
	})
});