/**
 * Created by Administrator on 14-1-8.
 */



var config = require('../config').aliyun,
SSDB = require('../src/SSDB'),
rHash = require('../src/RemoteHash');


var ssdbClient,remoteHash;

ssdbClient = SSDB.connect(config.ssdb.host, config.ssdb.port);
remoteHash = new rHash.RemoteHash(ssdbClient, {'serverType': 'ssdb', 'mainKey': 'aaa'});

setTimeout(function(){
  remoteHash.delMainKey(done);
}, 2000);

setTimeout(function(){
  remoteHash.get('key2' ,done);
}, 4000);

var done = function(err, reply){
  console.dir(err);
  console.dir(reply);
}

//remoteHash.set('key2', 'val2', done);
//remoteHash.exists('key2', done);


//ssdbClient.qpush('queue' , 'sodofo', done);
//ssdbClient.qpop_front('queue', done);
//ssdbClient.qsize('task_queue_key', done);
//ssdbClient.qclear('queue', done);
