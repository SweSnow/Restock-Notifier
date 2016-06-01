var request = require('request'),
	jsdom 	= require('jsdom'),
	fs		= require('fs');

var Palace = {
	BRAND_NAME: 'Palace',
	BASE_URL: 'http://shop.palaceskateboards.com',
	COLLECTIONS_URL: 'http://shop.palaceskateboards.com/collections/frontpage',
	SOLD_OUT: 'SOLD OUT'
};

exports.runUpdate = function(callback) {
	console.log('PALACE: Started');

	new Promise(function(palaceResolve, palaceReject) {
		getAvailablePageNumbers(function(pages) {
			var urls = [];
			for (var i = 0; i < pages.length; i++) {
				urls.push(Palace.COLLECTIONS_URL + '/?page=' + pages[i]);
			}

			new Promise(function(resolve, reject) {
				var items = [];
				var resolved = 0;

				urls.forEach(function(url) {
					getItemsOnPage(url, function(pageItems) {
						pageItems.forEach(function(pageItem) {
							items.push(pageItem);
						});

						resolved++;
						if (resolved == urls.length) {
							resolve(items);
						}
					})
				});
			}).then(function(allItems) {
				palaceResolve(allItems);
			});
		});
	}).then(function(result) {
		fs.writeFileSync('./data/palaceItems.json', JSON.stringify({
			updateTime: Date.now(),
			brand: Palace.BRAND_NAME,
			items: result
		}), 'utf-8');
		console.log('PALACE: Finished')
		callback();
	});
}

function getAvailablePageNumbers(callback) {
	request({
		uri: Palace.COLLECTIONS_URL,
		encoding: 'utf-8'},
		function(err, response, body) {
			if (err && response.statusCode !== 200) {
				console.log('PALACE: Request error at URL ' + Palace.COLLECTIONS_URL);
			}

			jsdom.env({
				html: body,
				scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
				done: function (err, window) {
					var $ = window.jQuery;

					var max = parseInt($('#content > div.pagination > a:nth-child(4)').text());

					var pageNumbers = [];

					for (var i = 1; i <= max; i++) {
						pageNumbers.push(i);
					}
					//TODO REMOVE
					pageNumbers = [1];

					callback(pageNumbers);
				}
			});
		}
	);
}

function getItemsOnPage(url, callback) {
	request({
		uri: url,
		encoding: 'utf-8'},
		function(err, response, body) {
			if (err && response.statusCode !== 200) {
				console.log('PALACE: Request error at URL ' + url);
			}

			jsdom.env({
				html: body,
				scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
				done: function (err, window) {
					var $ = window.jQuery;
					var items = [];
					var loopChildren = $('#product-loop').children();

					for (var i = 0; i < loopChildren.length; i++) {
						var loopChild = loopChildren[i];
						new Promise(function(resolve, reject) {
							var item = {};
							var product = $(loopChild).children();

							item.fullUrl = Palace.BASE_URL + product[0].href;
							item.name = $($($(product[1]).children())[0]).children()[0].innerHTML;

							item.soldOut = $($(product[1]).children())[1].innerHTML.trim() == Palace.SOLD_OUT;
							if (!item.soldOut) {
								item.price = $($($(product[1]).children())[1]).children()[0].innerHTML;
							}

							getImages(item.fullUrl, function(imageUrls) {
								item.smallImageUrl = imageUrls.small;
								item.largeImageUrl = imageUrls.large;
								resolve(item);
							});
						}).then(function(result) {
							items.push(result);
							if (items.length == loopChildren.length) {
								callback(items);
							}
						});
					}
				}
			});
		}
	);
}

function getImages(url, callback) {
	request({
		uri: url,
		encoding: 'utf-8'},
		function(err, response, body) {
			if (err && response.statusCode !== 200) {
				console.log('PALACE: Request error at URL ' + url);
			}

			jsdom.env({
				html: body,
				scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
				done: function (err, window) {
					var $ = window.jQuery;
					
					callback({
						large: $('.bigimage').children()[0].src,
						small: $('#product-photos > div.photos-grid.clearfix > a:nth-child(1) > img')[0].src.replace('_medium.jpg', '_large.jpg')
					});
				}
			});
		}
	);
}