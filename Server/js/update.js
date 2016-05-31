var request = require('request'),
	jsdom 	= require('jsdom'),
	palace 	= require('./palace.js'),
	supreme = require('./supreme.js')
	analyser = require('./analyser.js')
	fs 		= require('fs');


exports.attemptUpdate = function() {
	var data = JSON.parse(fs.readFileSync('./data/items.json', 'utf-8'));
	var needsUpdate = false;

	data.forEach(function(entry) {
		if (Date.now() - entry.updateTime > 5 * 60 * 1000) {
			needsUpdate = true;
		}
	});

	if (needsUpdate || true) {
		exports.runFullUpdate(function() {
			analyser.analyse();
		});
	}
}

exports.runFullUpdate = function(callback) {
	console.log('UPDATER: Full update started');

	var tasks = [palace, supreme];
	var completed = 0;

	tasks.forEach(function(task) {
		task.runUpdate(function() {
			completed++;
			if (completed == tasks.length) {
				callback();
			}
		});
	});

};