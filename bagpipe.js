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
var domainSetRedis = new rHash.RemoteHash(redisClient, {'serverType': 'redis', 'mainKey': 'domainSetkeys'});
//url 去重 set
var urlSetRedis = new rHash.RemoteHash(redisClient, {'serverType': 'redis', 'mainKey': 'urlSetkeys'});

//清空两个set
//domainSetRedis.delMainKey();
//urlSetRedis.delMainKey();

eventEmitter.on('event-error', errorHandler);
//在文件中记录新域名
eventEmitter.addListener('event-new-domain', write2File);

//将新域名放到去重队列中
eventEmitter.addListener('event-new-domain', function (domain) {
	//只根据url爬行，不额外添加域名
	//bagpipe.push({url: domain, retry: 0, timeout: 15000});
	//bagpipe.push({url: domain});
	domainSetRedis.set(utils.md5(domain), '1', function (err, reply) {
		if (err) {
			eventEmitter.emit('event-error', 'domainSetRedis set error when domain = ' + domain + ' ' + err);
		}
	});
});

//将新域名放到去重set和爬取队列中
eventEmitter.addListener('event-new-url' , function(url){
	//bagpipe.push({url: domain, retry: 0, timeout: 15000});
	bagpipe.push({url: url});
	urlSetRedis.set(utils.md5(url), '1', function (err, reply) {
		if (err) {
			eventEmitter.emit('event-error', 'urlSetRedis set error when url = ' + url + ' ' + err);
		}
	});
});


var START_TASK = [
	//{url: 'http://www.hao123.com', retry: 0, timeout: 15000}
	//{url: 'http://www.hao123.com'}
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

	var timeout = 30000;
	R.get(task.url, {timeout: timeout}, function (err, response, body) {

		cb();//网络请求结束，调用下一个task

		if (err) {
			eventEmitter.emit('event-error', 'error get ' + task.url + ' ' + err);
			/*
			//取消重试
			task.retry += 1;
			if (task.retry < RETRY_TIMES) {
				task.timeout *= 2;
				bagpipe.push(task);
				console.log('retry task' + task.url);
			}
			*/
			return;
		}

		if (response.statusCode === 200) {
			//统一按utf-8解码
			//todo:根据response header的 " Content-Type:text/html;charset=utf-8"
			//todo: 以及<meta http-equiv="content-type" content="text/html;charset=utf-8">解码
			body = iconvLite.decode(body, 'utf8');
			var $ = cheerio.load(body);
			var domains = [];
			var hrefs = [];


      var baseUrlObj = urlParser.parse(task.url);
      //console.log('baseurlObj');
      //console.dir(baseUrlObj);

			//start 提取
			// 页面中的链接到hrefs,页面中出现的域名到domains
			$('a').each(function (i, ele) {
				var href = $(ele).attr('href') || '';
        //console.dir('origin href')
        //console.dir(href)

				var res = urlParser.parse(href);
        //console.log('res1');
        //console.dir(res);
        for(var key in res){
          if(_.isNull(res[key])){
            res[key] = baseUrlObj[key]
          }
        }

        //console.log('res2');
        //console.dir(res);

        if(res.protocol == 'http:' || res.protocol == 'https:'){
          href = urlParser.format(res);
          //console.log('href');
          //console.dir(href);
          hrefs.push(href)
        }

				var domain = res.host;

				if (domain) {
					domain = res.protocol + '//' + domain;
					if (res.port) {
						domain = domain + ':' + res.port;
					}
					domains.push(domain);
				}
			});
			//end 提取

			//start 去重
			hrefs = _.uniq( hrefs);
      console.dir(hrefs)
			domains = _.uniq(domains);
			//end 去重

			_.each(hrefs , function(url){
				urlSetRedis.exist(utils.md5(url) , function(err , reply){
					if (err) {
						eventEmitter.emit('event-error', 'urlSetRedis exist error when test ' + domain + ' ' + err);
						return;
					}

					//reply == 0, 说明没有
					if (!reply) {
						eventEmitter.emit('event-new-url', url);
					}

				});
			});

			//start 测试是否新域名
			// domainSetRedis中存储着发现过的domain

			_.each(domains, function (domain) {
				domainSetRedis.exist(utils.md5(domain), function (err, reply) {
					if (err) {
						eventEmitter.emit('event-error', 'domainSetRedis exist error when test ' + domain + ' ' + err);
						return;
					}

					if (!reply) {
						eventEmitter.emit('event-new-domain', domain);
					}
				});
			});
			//end 测试新域名

		}
	});

}


crawler.start = function () {
	bagpipe.getLen();

	_.each(START_TASK, function (task) {
		bagpipe.push(task);
	});
	bagpipe.observer();
}

var bagpipe = new RedisBagpipe(redisClient, 'task_queue_key',
	crawler.oneurl, function () {
	}, 3);


//bagpipe.clear();//是否从头开始爬

bagpipe.on('full', function (length) {

	console.log('xxxxxxxxxxxxx，目前长度为' + length);
	process.exit();

});

//http://www.rainweb.cn/article/355.html
process.on('uncaughtException', function(err){
	console.log('Caught exception:' + err);

});

setTimeout(crawler.start, 3000);




