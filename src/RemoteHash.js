/**
 * Created by Administrator on 14-1-8.
 */

function RemoteHash(server, options) {
	this.server = server;
	this.options = options = options || {};
	this.serverType = options.serverType;
	this.mainKey = options.mainKey;

}
exports.RemoteHash = RemoteHash;

RemoteHash.prototype.setMainKey = function (mainKey) {
  this.mainKey = mainKey;
};

RemoteHash.prototype.set = function (key, value, cb) {
  switch (this.serverType) {
    case 'redis':
    case 'ssdb':

    default :
      this.server.hset(this.mainKey, key, value, cb);

  }
};

RemoteHash.prototype.inc = function (key, cb) {
  switch (this.serverType) {
    case 'redis':
      this.server.hincrby(this.mainKey, key, 1 , cb);
      break;
    case 'ssdb':
      this.server.hincr(this.mainKey, key, 1 , cb);
      break;
    default :

  }
};

RemoteHash.prototype.exists = function (key, cb) {
  switch (this.serverType) {
    case 'redis':
    case 'ssdb':

    default :
      this.server.hexists(this.mainKey, key, cb);

  }
};

RemoteHash.prototype.get = function (key, cb) {
  switch (this.serverType) {
    case 'redis':
    case 'ssdb':

    default :
      this.server.hget(this.mainKey, key, cb);

  }
};

RemoteHash.prototype.delMainKey = function (cb) {
  switch (this.serverType) {
    case 'redis':
      this.server.del(this.mainKey, cb);
      break;
    case 'ssdb':
      this.server.hclear(this.mainKey, cb);
      break;

    default :

  }
};

