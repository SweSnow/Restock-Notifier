var fs = require('fs');

exports.newEvents = function(eventsIn) {
	if (eventsIn.length == 0) {
		return console.log('STOCK CHANGE: No new events, terminating');
	}

	console.log('STOCK CHANGE: Started');

	var oldData = JSON.parse(fs.readFileSync('./data/events.json', 'utf-8'));
	var events = [];
	if (oldData && oldData.events) {
		events = oldData.events;
	}

	console.log('New items added at ' + Date.now());
	eventsIn.forEach(function(event) {
		console.log('Added ' + event.item.name);
	});

	eventsIn.forEach(function(event) {
		events.push(event);
	});

	fs.writeFileSync('./data/events.json', JSON.stringify({
		updateTime: Date.now(),
		events: events
	}), 'utf-8');

	console.log('STOCK CHANGE: Finished');
};

exports.updateSoldOutStatuses = function(items) {
	var oldData = JSON.parse(fs.readFileSync('./data/events.json', 'utf-8'));
	if (!oldData || !oldData.events) {
		return;
	}

	oldData.events.forEach(function(event) {
		items.forEach(function(brandItemHolder) {
			if (brandItemHolder.brand == event.item) {
				brandItemHolder.items.forEach(function(item) {
					if (event.item.name == item.name) {
						event.item = item;
					}
				});
			}
		})
	});
}