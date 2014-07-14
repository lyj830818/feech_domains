/**
 * Created by Administrator on 14-1-8.
 */



var config = require('../config').aliyun,
	redis = require('redis'),
	rHash = require('../src/RemoteHash'),
	should = require('chai').should();

describe('RemoteHash', function () {
	this.timeout(5000);

	var redisClient ,
		remoteHash;

	before(function (done) {
		redisClient = redis.createClient(config.redis.port, config.redis.host);
		remoteHash = new rHash.RemoteHash(redisClient, {'serverType': 'redis', 'mainKey': 'aaa'});
		remoteHash.delMainKey(done);

	});

	describe('.set', function () {
		it('set key1 val1', function (done) {
			remoteHash.set('key1', 'val1', done);

		});
	});

	describe('.get ', function () {
		it('get key1 ', function (done) {
			remoteHash.get('key1', function (err, replies) {
				if (replies === 'val1') {
					done();
				}
			});

		});
	});

	describe('.exist', function () {
		it('exist key1', function (done) {
			remoteHash.exist('key1', function (err, replies) {
				if (replies === 1) {
					done();
				}
			});

		});
		it('exist key2', function (done) {
			remoteHash.exist('key2', function (err, replies) {
				if (replies === 0) {
					done();
				}
			});
		});

	});

});
