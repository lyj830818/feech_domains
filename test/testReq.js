/**
 * Created by Administrator on 14-1-9.
 */

var config = require('../config').aliyun,
	should = require('chai').should(),
	req = require('../src/Req'),
	iconvLite = require('iconv-lite'),
	cheerio = require('cheerio');


describe('Req', function () {
	this.timeout(10000);

//    before(function( done ){
//        redisClient = redis.createClient(config.redis.port , config.redis.host);
//        remoteHash = new rHash.RemoteHash(redisClient , {'serverType' : 'redis','mainKey' : 'aaa'});
//        remoteHash.delMainKey(done);
//
//    });

	describe('req.get', function () {
		it('get baidu', function (done) {
			var url = "http://www.baidu.com";
			var R = new req.Req();
			R.get(url, function (err, response, body) {
				body = iconvLite.decode(body, 'utf8');
				var $ = cheerio.load(body);

//                $('a').each(function (i, ele) {
//                    console.log($(ele).attr('href'));
//                });
				done();
			});

		});


	});


});
