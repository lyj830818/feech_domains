/**
 * Created by Administrator on 14-1-8.
 */

var config = require('../config').aliyun,
	should = require('chai').should(),
	urlParser = require('url'),
	request = require('request'),
	crypto = require('crypto');


describe('Utils', function () {
	this.timeout(5000);

//    before(function( done ){
//        redisClient = redis.createClient(config.redis.port , config.redis.host);
//        remoteHash = new rHash.RemoteHash(redisClient , {'serverType' : 'redis','mainKey' : 'aaa'});
//        remoteHash.delMainKey(done);
//
//    });

	describe('url.parse', function () {
		it('parse domain', function () {
			var url = "http://dlfdd.dfdff.sodif.com.cn/sldllf/?a=123&b=123sd";
			var res = urlParser.parse(url);
			res.host.should.equal('dlfdd.dfdff.sodif.com.cn');
		});

		it('parse error url', function () {
			var url = "/sldllf/?a=123&b=123sd";
			var res = urlParser.parse(url);
			should.not.exist(res.host);

			url = '#';
			res = urlParser.parse(url);
			should.not.exist(res.host);
		});

	});

	describe('crypto', function () {
		it.only('md5', function () {
			var str = "45sdfdfdf";
			var md5 = crypto.createHash('md5');
			var res = md5.update(str).digest('hex');
			console.log(res);
			str = "45sdfdfdf";
			res = md5.update(str).digest('hex');
			console.log(res);
			res.should.equal('827ccb0eea8a706c4c34a16891f84e7b');
		});


	});

	describe('request', function () {
		it.skip('request.get', function (done) {
			var url = "http://www.baidu.com";
			var iconv = require('iconv-lite');

			request.get(url, function (err, response, body) {
				if (!err && response.statusCode === 200) {
					//console.log(typeof (body));
					done();
				}
			});
		});

		it.skip('request() followRedirect headers', function (done) {
			var url = "http://www.baidu.com",
				iconvLite = require('iconv-lite'),
				cheerio = require('cheerio');

			var headers = {
				'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36',
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
			};

			var option = {
				'url': url,
				'method': 'GET',
				'headers': headers,
				'followRedirect': true,
				'encoding': null,
				'timeout': 20000

			};

			//encoding = null 则 body instance === Buffer

			request(option, function (err, response, body) {
				if (!err && response.statusCode === 200) {
					body = iconvLite.decode(body, 'utf8');
					var $ = cheerio.load(body);

//                    $('a').each(function(i ,ele){
//                       console.log($(ele).attr('href'));
//                    });
					console.dir($('a').attr('href'));
					done();
				}
			});
		});

		it.skip('request() jQuery', function (done) {
			var url = "http://www.baidu.com",
				iconvLite = require('iconv-lite'),
				$ = require('jQuery');

			var headers = {
				'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36',
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
			};

			var option = {
				'url': url,
				'method': 'GET',
				'headers': headers,
				'followRedirect': true,
				'encoding': null,
				'timeout': 20000

			};

			//encoding = null 则 body instance === Buffer

			request(option, function (err, response, body) {
				if (!err && response.statusCode === 200) {
					body = iconvLite.decode(body, 'utf8');
					var dom = $(body);
					dom.find('a').each(function (i, elem) {
						console.log($(elem).attr('href'));
					});
					done();
				}
			});
		});
	});


});
