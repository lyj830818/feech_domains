/**
 tessssssss
 * Created by Administrator on 14-1-8.
 */
var config = require('./config').aliyun,
	redis = require('redis'),
	rHash = require('./src/RemoteHash'),
	req = require('./src/Req'),
	_ = require('underscore'),
	events = require('events'),
	iconvLite = require('iconv-lite'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	urlParser = require('url'),
	crypto = require('crypto'),
	utils = require('./src/utils.js');

var eventEmitter = new events.EventEmitter();

var errorHandler = function (message) {
	console.log(message);
}

var domainStream = fs.createWriteStream('./domains.txt', {flags: 'a', encoding: 'utf8'});
var taskQueue = [];


var write2File = function (domain) {
	//console.log(domain);
	domainStream.write(domain + '\n');
}


var redisClient = redis.createClient(config.redis.port, config.redis.host);
var remoteHash = new rHash.RemoteHash(redisClient, {'serverType': 'redis', 'mainKey': 'hashkeys'});

remoteHash.delMainKey();

eventEmitter.on('event-error', errorHandler);
eventEmitter.addListener('event-new-domain', write2File);
eventEmitter.addListener('event-new-domain', function (domain) {
	taskQueue.push(domain);
	remoteHash.set(utils.md5(domain), '1', function (err, reply) {
		if (err) {
			eventEmitter.emit('event-error', 'remotehash set error when domain = ' + domain + ' ' + err);
		}
	});
});


var START_URL = [
	// 'http://hao123.com',
	'http://2345.com'
];


var crawer = {};
var R = new req.Req();

crawer.oneurl = function (url) {

	console.log(url);

	R.get(url, function (err, response, body) {
		if (err) {
			eventEmitter.emit('event-error', 'error get ' + url + ' ' + err);
			return;
		}

		if (response.statusCode === 200) {
			body = iconvLite.decode(body, 'utf8');
			var $ = cheerio.load(body);
			var domains = [];

			$('a').each(function (i, ele) {
				var href = $(ele).attr('href') || '';
				var res = urlParser.parse(href);
				var domain = res.host;

				if (domain) {
					domain = res.protocol + '//' + domain;
					if (res.port) {
						domain = domain + ':' + res.port;
					}
					domains.push(domain);
				}
			});

			domains = _.uniq(domains);

			_.each(domains, function (domain) {
				remoteHash.exist(utils.md5(domain), function (err, reply) {
					if (err) {
						eventEmitter.emit('event-error', 'domainSet exist error when test ' + domain + ' ' + err);
						return;
					}

					if (!reply) {
						eventEmitter.emit('event-new-domain', domain);
					}
				});
			});

		}


	});
}
var nextOneHandler = function () {
	var url = taskQueue.shift();
	if (url) {
		crawer.oneurl(url);
	}
	setImmediate(nextOneHandler);
}

crawer.start = function () {
	_.each(START_URL, crawer.oneurl);
	setImmediate(nextOneHandler);
}

crawer.start();





