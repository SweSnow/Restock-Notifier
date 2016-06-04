var request = require('request'),
	jsdom	= require('jsdom'),
	fs		= require('fs');

var Supreme = {
	BRAND_NAME: 'Supreme',
	BASE_URL: 'http://www.supremenewyork.com',
	ALL_PAGE_URL: 'http://www.supremenewyork.com/shop/all',
	ADD_TO_BASKET: 'add to basket'
};

// getSupreme: () -> Promise
// Promise.all([getSupreme(), getPalace()]).then(function(values) {
// 	var supreme = values[0];
// 	var palace = values[1];
// });

// var promises = items.map(x => new Promise((resolve) => resolve()))
// Promise.all(promises).then((values) => )

// Promise.all(items.map(function(item) {
// 	return new Promise(function(resolve) {
// 		resolve();
// 	});
// }))
// .then()

exports.runUpdate = function(callback) {
	new Promise(function(supremeResolve, supremeReject) {
		console.log('SUPREME: Started');
		getItemUrlsOnPage(Supreme.ALL_PAGE_URL, function(urls) {
			var resolved = 0;
			var items = [];

			urls.forEach(function(url) {
				new Promise(function(traverseResolve, traverseReject) {
					getItemInfo(Supreme.BASE_URL + url, function(item) {
						traverseResolve(item);
					});
				}).then(function(result) {
					items.push(result);
					resolved++;

					if (resolved == urls.length) {
						supremeResolve(items);
					}
				});
			});
		});
	}).then(function(result) {
		fs.writeFileSync('./data/supremeItems.json', JSON.stringify({
			updateTime: Date.now(),
			brand: 'Supreme',
			items: result
		}), 'utf-8');
		console.log('SUPREME: Finished')
		callback();
	});
}

function getItemUrlsOnPage(url, callback) {
	request({
		uri: url,
		encoding: 'utf-8'},
		function(err, response, body) {
			if (err && response.statusCode !== 200) {
				console.log('SUPREME: Request error at URL ' + url);
			}

			jsdom.env({
				html: body,
				scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
				done: function (err, window) {
					var $ = window.jQuery;
					var items = [];
					var children = $('#container').children();

					for (var i = 0; i < children.length; i++) {
						items.push($($(children[i]).children()[0]).children()[0].href);
					};

					callback(items);
				}
			});
		}
	);
}

function getItemInfo(url, callback) {
	request({
		uri: url,
		encoding: 'utf-8'},
		function(err, response, body) {
			if (err && !response || response.statusCode !== 200) {
				console.log('SUPREME: Request error at URL ' + url);
				return;
			}
			jsdom.env({
				html: body,
				scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
				done: function (err, window) {
					var $ = window.jQuery;

					callback({
						name: $('#details > h1').text() + ' ' + $('#details > p.style').text(),
						price: $('#details > p.price > span:nth-child(1)').text(),
						fullUrl: url,
						smallImageUrl: $('#img-main')[0].src,
						largeImageUrl: $('#zoom-holder')[0].src,
						soldOut: !$('#add-remove-buttons > input')[0]
					});
				}
			});
		}
	);
}