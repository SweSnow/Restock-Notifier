var fs 				= require('fs'),
	stockChange 	= require('./stockChange.js');

exports.analyse = function() {

	console.log('ANLYSER: Started');

	var oldData = JSON.parse(fs.readFileSync('./data/items.json', 'utf-8'));
	var newPalace = JSON.parse(fs.readFileSync('./data/palaceItems.json', 'utf-8'));
	var newSupreme = JSON.parse(fs.readFileSync('./data/supremeItems.json', 'utf-8'));
	var newItems = [newPalace, newSupreme];

	if (!oldData || oldData.length == 0) {
		oldData = [];
		newItems.forEach(function(brand) {
			oldData.push({
				updateTime: 0,
				brand: brand.brand,
				items: []
			});
		});
	}

	var newEvents = [];

	for (var k = 0; k < newItems.length; k++) {
		var items = newItems[k].items;
		var oldItems = oldData[k].items;
		for (var i = 0; i < items.length; i++) {
			var foundInOld = false;
			if (oldItems) {
				for (var j = 0 ; j < oldItems.length; j++) {
					if (items[i].name == oldItems[j].name) {
						foundInOld = true;
						if (!items[i].soldOut && oldItems[j].soldOut) {
							newEvents.push({
								brand: newItems[k].brand,
								brandUrl: getBrandUrl(newItems[k].brand),
								item: items[i],
								type: 'restock',
								time: Date.now()
							});
						} else if (!oldItems[j].price != !items[i].price) {
							newEvents.push({
								brand: newItems[k].brand,
								brandUrl: getBrandUrl(newItems[k].brand),
								item: items[i],
								type: 'priceChange',
								time: Date.now()
							});
						}
					}
				}
			}

			if (!foundInOld) {
				newEvents.push({
					brand: newItems[k].brand,
					brandUrl: getBrandUrl(newItems[k].brand),
					item: items[i],
					type: 'stock',
					time: Date.now()
				});
			}
		}
	}

	if (newEvents.length > 0) {
		console.log("ANALYSER: Found " + newEvents.length + ' new items, adding to events');
		stockChange.newEvents(newEvents);
	} else {
		console.log('ANALYSER: No difference found');
	}

	stockChange.updateSoldOutStatuses(newItems);

	fs.writeFileSync('./data/items.json', JSON.stringify(newItems), 'utf-8');

	console.log('ANALYSER: Finished');
}

function getBrandUrl(brand) {
	switch (brand) {
		case 'Palace': return '192.168.0.11:3000/images/palace.png'; break;
		case 'Supreme': return '192.168.0.11:3000/images/supreme.png'; break;
	}
	return '';
}