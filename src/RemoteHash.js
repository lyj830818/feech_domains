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

RemoteHash.prototype.setMainKey = function ( mainKey){
    switch (this.serverType) {
        case 'redis':
            this.mainKey = mainKey;
            break;

        default :

    }
};

RemoteHash.prototype.set = function(key , value , cb ){
    this.server.hset(this.mainKey , key , value , cb);
};

RemoteHash.prototype.exist = function (key ,cb){
    this.server.hexists(this.mainKey ,key , cb);
};

RemoteHash.prototype.get = function (key ,cb){
    this.server.hget(this.mainKey ,key , cb);
};

RemoteHash.prototype.delMainKey = function (cb){
    this.server.del(this.mainKey , cb);
};

