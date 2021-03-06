/**
 tessssssss
 * Created by Administrator on 14-1-8.
 */

var config = require('./config').mania,
	redis = require('redis'),
  SSDB = require('./src/SSDB.js'),
	rHash = require('./src/RemoteHash'),
	//req = require('./src/Req'),
	netReq = require('./src/netReq'),
	_ = require('underscore'),
	events = require('events'),
	iconvLite = require('iconv-lite'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	urlParser = require('url'),
	crypto = require('crypto'),
	utils = require('./src/utils.js'),
	Bagpipe = require('./src/observer-redis-bagpipe'),
	parseDomain = require("parse-domain");

var logger = require('./src/Logger').logger;

var MAX_URL_PER_DOMAIN = 30;
var MAX_URL_TO_ADD_ONE_PAGE = 5;
var CONCURRENCE = 100;

var START_TASK;


var eventEmitter = new events.EventEmitter();

//var domainStream = fs.createWriteStream('./domains.txt', {flags: 'a', encoding: 'utf8'});
//var overFlowUrls = fs.createWriteStream('./overflow-urls.txt', {flags: 'a', encoding: 'utf8'});

var dnsErrorDmStream = fs.createWriteStream('./dns-error1.txt', {flags: 'a', encoding: 'utf8'});
var networkTimeoutDmStream = fs.createWriteStream('./net-timeout-dm.txt', {flags: 'a', encoding: 'utf8'});



var redisClient = redis.createClient(config.redis.port, config.redis.host);
var resultRedisClient = redis.createClient(config.result_redis.port, config.result_redis.host);

//var ssdbClient = SSDB.connect( config.ssdb.host,config.ssdb.port );

//记录每个域名爬过的页面数
//var domainSet = new rHash.RemoteHash(ssdbClient, {'serverType': 'ssdb', 'mainKey': 'domainSetkeys'});
var domainSet = new rHash.RemoteHash(redisClient, {'serverType': 'redis', 'mainKey': 'domainSetkeys'});
//url 去重 set
//var urlSet = new rHash.RemoteHash(ssdbClient, {'serverType': 'ssdb', 'mainKey': 'urlSetkeys'});
var urlSet = new rHash.RemoteHash(redisClient, {'serverType': 'redis', 'mainKey': 'urlSetkeys'});



var errorHandler = function (message, obj) {
  //
  if(message.indexOf('getHostByName ETIMEOUT') >= 0 || (obj && obj.err && obj.err.syscall == 'getHostByName')){
    dnsErrorDmStream.write( obj.url + '\n');
  }
  if(obj && obj.err == 'NetReq Timeout Emitted' ){
    networkTimeoutDmStream.write( obj.url + '\n');
  }
  console.log(message);
}




var write2File = function (domain) {
	//logger.debug(domain);
	//var success = domainStream.write(domain + '\n');
  //console.dir('write success:' + success);
  //logger.debug('qpush domains');

//  ssdbClient.qpush('domains' , domain , function(err , reply){
  resultRedisClient.rpush('domains' , domain , function(err , reply){
    if(err){
      eventEmitter.emit('event-error', 'push error domain = ' + domain + ' ' + err);
    }
  });

}




eventEmitter.on('event-error', errorHandler);
//在文件中记录新域名
eventEmitter.addListener('event-new-domain', write2File);


eventEmitter.addListener('event-inc-domain-url', function(domain){
  //logger.debug('domainSet inc~~~~');
	domainSet.inc(utils.md5(domain), function (err, reply) {
		if (err) {
			eventEmitter.emit('event-error', 'domainSet inc error when domain = ' + domain + ' ' + err);
		}
	});
});

//将新域名放到去重set和爬取队列中
eventEmitter.addListener('event-new-url' , function( rootDomain , url){
	//bagpipe.push({url: domain, retry: 0, timeout: 15000});
	bagpipe.push({url: url});

  eventEmitter.emit('event-inc-domain-url' , rootDomain );

  //logger.debug('urlSet set~~~~');
	urlSet.set(utils.md5(url), '1', function (err, reply) {
		if (err) {
			eventEmitter.emit('event-error', 'urlSet set error when url = ' + url + ' ' + err);
		}
	});
});




var crawler = {};
var R = new netReq.Req();
var RETRY_TIMES = 2;

var request_id = 0;
var respNetErrMap = {};
crawler.oneurl = function (task, cb, task_idx) {

	//logger.debug(task.url);
	//logger.debug(task.timeout);

	var timeout = 60000;
  logger.debug('send request_id : %d', ++request_id);
  logger.debug('getting url : %s', task.url);
	R.get(task.url, {timeout: timeout}, function (err, response, body) {


    var copy_req_id = request_id;
    logger.debug('receive request_id : %d' , copy_req_id);
		cb(task_idx);//网络请求结束，调用下一个task


		if (err) {
      //重试一次
      /*
			if ( (err == 'ETIMEDOUT' || err == 'ESOCKETTIMEDOUT') && _.isUndefined(task.retry) ) {
				//task.timeout *= 2;
        task.retry = 1;
				bagpipe.push(task);
				logger.debug('retry task' + task.url);
			}
     */

			eventEmitter.emit('event-error', 'error get request_id:' + request_id + ' ' + err,{ url:task.url, err : err});
      if( err == 'ETIMEDOUT' || err == 'ESOCKETTIMEDOUT'){
          respNetErrMap[request_id] = '1';
          checkNeedRestart(respNetErrMap, request_id);
      }
			return;
		}
		if (response.statusCode === 200) {
			//统一按utf-8解码
			//todo:根据response header的 " Content-Type:text/html;charset=utf-8"
			//todo: 以及<meta http-equiv="content-type" content="text/html;charset=utf-8">解码
      if(!body){
        return;
      }
			body = iconvLite.decode(body, 'utf8');
			var $ = cheerio.load(body);
			var hrefs = [];


      var baseUrlObj = urlParser.parse(task.url);
      //logger.debug('baseurlObj');
      //logger.debug(baseUrlObj);

			//start 提取
			// 页面中的链接到hrefs,页面中出现的域名到domains
			$('a').each(function (i, ele) {
				var href = $(ele).attr('href') || '';
        //logger.debug('origin href')
        //logger.debug(href)

				var res = urlParser.parse(href);
        //logger.debug('res1');
        //logger.debug(res);
        for(var key in res){
          if(_.isNull(res[key])){
            res[key] = baseUrlObj[key]
          }
        }

        //logger.debug('res2');
        //logger.debug(res);

        if(res.protocol == 'http:' || res.protocol == 'https:'){
          href = urlParser.format(res);
          //logger.debug('href');
          //logger.debug(href);
          hrefs.push(href)
        }


			});
			//end 提取

			//start 去重
			hrefs = _.uniq( hrefs);
      //logger.debug("request_id: %s ,got hrefs :" , request_id);
      //logger.debug(hrefs)
			//end 去重
      //
      //

      var rootDomainHash = {};
      var urlDomainHash = {};

      function addNewDomain(rootDomain, wholeDomain){
        if(!rootDomainHash[rootDomain]){

          eventEmitter.emit('event-new-domain', wholeDomain);
          rootDomainHash[rootDomain] = 1;
          logger.debug("add new domain:%s", rootDomain);
          eventEmitter.emit('event-inc-domain-url' , rootDomain );
        }

      }

      function addUrl(rootDomain , url){
        if(!urlDomainHash[rootDomain]){
          eventEmitter.emit('event-new-url', rootDomain, url);// 在这里才加入
          urlDomainHash[rootDomain] = 1;
         // logger.debug("add url:%s", url);


        }else if (urlDomainHash[rootDomain] < MAX_URL_TO_ADD_ONE_PAGE){
          eventEmitter.emit('event-new-url', rootDomain,url);// 在这里才加入
          urlDomainHash[rootDomain]++;
          //logger.debug("add url:%s", url);


        }

      }
			_.each(hrefs , function(url){

				var dmInfo = parseDomain(url);
        if(dmInfo == null){
          return;
        }
        //logger.debug(dmInfo);
				var rootDomain = dmInfo.domain + '.' + dmInfo.tld;
        var wholeDomain = rootDomain;
        if(dmInfo.subdomain){
          wholeDomain = dmInfo.subdomain + '.' + wholeDomain;
        }

        //logger.debug(rootDomain);


				urlSet.exists(utils.md5(url) , function(err , reply){
					if (err) {
						eventEmitter.emit('event-error', 'urlSet exists error when test ' + domain + ' ' + err);
						return;
					}

          //logger.debug('url set redis reply : ' + reply);
          //logger.debug('url : ' + url);
					//reply == 0, 说明没有
					if (!reply) {
						//发现一个新url
						//是否加入队列，取决于该域名下爬了多少个
						domainSet.get(utils.md5(rootDomain), function (err, reply) {
							//logger.debug('domain set get:' + reply);
							//logger.debug('domain :' + rootDomain);

							if (err && err !== 'not_found') {
								eventEmitter.emit('event-error','request_id:'+request_id+' domainSet get error when test ' + rootDomain + ' ' + err);
								return;
							}

              reply = parseInt(reply);

							if (_.isNaN(reply)) {
                addNewDomain(rootDomain, wholeDomain); 

                addUrl(rootDomain , url);

							}else if(reply < MAX_URL_PER_DOMAIN ){
                
                addUrl(rootDomain , url);
              }else{
                //logger.debug("fetch url or url in queue from " + rootDomain + ' is ' + reply + ' times' );
              }

						});

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
	});
	bagpipe.observer();
	bagpipe.UpLenForever();
}

//var bagpipe = new Bagpipe('ssdb' , ssdbClient, 'task_queue_key',
var bagpipe = new Bagpipe('redis' , redisClient, 'task_queue_key',
	crawler.oneurl, function () {
	}, CONCURRENCE);




bagpipe.on('full', function (length, url) {

	logger.debug('xxxxxxxxxxxxx，目前长度为' + length);
	process.exit();

});

bagpipe.on('ssdb-error', function (length, url) {
	process.exit();
});

bagpipe.on('restart', function (length, url) {
	process.exit();
});

//http://www.rainweb.cn/article/355.html

process.on('uncaughtException', function(err){
	logger.debug('Caught exception:' + err);
  logger.warn(err.stack)

});

/*
process.on('exit', function () {
  //domainStream.end();
  console.log('Bye.');
});
*/

process.on('SIGINT', function() {
  logger.info("Caught interrupt signal");
  process.exit();
});

function checkNeedRestart(respNetErrMap, id){

  var totalErr = 0;
  var start = id - 20;
  start = start >= 0 ? start : 0;
  for(var i = start ; i <= id; i++){
    if(respNetErrMap[i] === 1){
      totalErr++;
    }
  }

  logger.info("recent resp has %d's network error", totalErr);

  if(totalErr > 10){
    logger.info("recent resp has %d's network error,so need to restart", totalErr);
    process.exit();
  }


}

function clearAll(){
	START_TASK = [
		//{url: 'http://www.hao123.com', retry: 0, timeout: 15000}
	{url: 'http://www.2345.com'}
	];

//清空两个set
	domainSet.delMainKey();
	urlSet.delMainKey();
	bagpipe.clear();//是否从头开始爬
}

setTimeout(clearAll,1000);

setTimeout(crawler.start, 3000);




