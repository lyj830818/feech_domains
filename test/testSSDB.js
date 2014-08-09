/**
 * Created by Administrator on 14-1-8.
 */



var config = require('../config').vbox,
SSDB = require('../src/SSDB'),
rHash = require('../src/RemoteHash');


var ssdbClient,remoteHash;


console.dir(config)
ssdbClient = SSDB.connect(config.ssdb.host, config.ssdb.port);

remoteHash = new rHash.RemoteHash(ssdbClient, {'serverType': 'ssdb', 'mainKey': 'aaa'});

/*
setTimeout(function(){
  remoteHash.delMainKey(done);
}, 2000);

setTimeout(function(){
  remoteHash.get('key2' ,done);
}, 4000);
*/

var done = function(err, reply){
  console.dir(err);
  console.dir(reply);
}

//remoteHash.set('key2', 'val2', done);
//remoteHash.exists('key2', done);

var val = [{"url":"http://www.haonai365.com/items/Jftf.html?id=491&cid=01"}];
val = JSON.stringify(val);


//ssdbClient.qpush('task_queue_key', val, done);
//ssdbClient.qpop_front('task_queue_key', done);
ssdbClient.qsize('task_queue_key', done);
//ssdbClient.qclear('queue', done);
//
