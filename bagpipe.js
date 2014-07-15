/**
 tessssssss
 * Created by Administrator on 14-1-8.
 */
var config = require('./config').vbox,
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
	utils = require('./src/utils.js'),
	RedisBagpipe = require('./src/observer-redis-bagpipe');


var eventEmitter = new events.EventEmitter();

var errorHandler = function (message) {
	console.log(message);
}

var domainStream = fs.createWriteStream('./domains.txt', {flags: 'a', encoding: 'utf8'});


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
	bagpipe.push({url: domain, retry: 0, timeout: 15000});
	remoteHash.set(utils.md5(domain), '1', function (err, reply) {
		if (err) {
			eventEmitter.emit('event-error', 'remotehash set error when domain = ' + domain + ' ' + err);
		}
	});
});


var START_TASK = [
	{url: 'http://www.hao123.com', retry: 0, timeout: 15000}
	//'http://2345.com'
//    'http://calistar.cn/timeout.php',
//    'http://calistar.cn/timeout2.php',
//    'http://calistar.cn/timeout3.php',
//    'http://calistar.cn/timeout4.php'

];


var crawler = {};
var R = new req.Req();
var RETRY_TIMES = 2;
crawler.oneurl = function (task, cb) {

	//console.log(task.url);
	//console.log(task.timeout);


	R.get(task.url, {timeout: task.timeout}, function (err, response, body) {

		cb();//网络请求结束，调用下一个task

		if (err) {
			eventEmitter.emit('event-error', 'error get ' + task.url + ' ' + err);
			task.retry += 1;
			if (task.retry < RETRY_TIMES) {
				task.timeout *= 2;
				bagpipe.push(task);
				console.log('retry task' + task.url);
			}
			return;
		}

		if (response.statusCode === 200) {
			//统一按utf-8解码
			//todo:根据response header的 " Content-Type:text/html;charset=utf-8"
			//todo: 以及<meta http-equiv="content-type" content="text/html;charset=utf-8">解码
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
						eventEmitter.emit('event-error', 'remoteHash exist error when test ' + domain + ' ' + err);
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


crawler.start = function () {
	bagpipe.getLen();

	_.each(START_TASK, function (task) {
		bagpipe.push(task);
		bagpipe.observer();
	});
}

var bagpipe = new RedisBagpipe(redisClient, 'task_queue_key',
	crawler.oneurl, function () {
	}, 10);
bagpipe.clear();

bagpipe.on('full', function (length) {

	console.log('xxxxxxxxxxxxx，目前长度为' + length);

});

//http://www.rainweb.cn/article/355.html
process.on('uncaughtException', function(err){
	console.log('Caught exception:' + err);
});

setTimeout(crawler.start, 3000);




