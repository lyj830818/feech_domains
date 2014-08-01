var config = require('./config').aliyun,
  redis = require('redis'),
  _ = require('underscore'),
  fs = require('fs'),
  utils = require('./src/utils.js'),
  SSDB = require('./src/SSDB.js'),
  Bagpipe = require('./src/observer-redis-bagpipe');


var ssdbClient = SSDB.connect( config.ssdb.host,config.ssdb.port, function(err){});

var bagpipe = new Bagpipe('ssdb' , ssdbClient, 'task_queue_key',
                               function(){}, function () {
                               }, 3);



var addTask = function (){
var txt = fs.readFileSync('wm123_links.txt', 'utf-8');
var domains = txt.split("\n");
for(var i in domains){
  domain = domains[i].trim();
  if(domain == ''){
    continue;
  }
  domain = 'http://' + domain;
  bagpipe.push({url: domain})
  }
}

bagpipe.clear();
bagpipe.UpLenForever();

setTimeout(addTask, 3000);

