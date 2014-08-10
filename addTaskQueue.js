var config = require('./config').mania,
  redis = require('redis'),
  _ = require('underscore'),
  fs = require('fs'),
  utils = require('./src/utils.js'),
  Bagpipe = require('./src/observer-redis-bagpipe');


var redisClient = redis.createClient(config.redis.port, config.redis.host);

var bagpipe = new Bagpipe('redis', redisClient, 'task_queue_key',
                               function(){}, function () {
                               }, 3);



var addTask = function (){
var txt = fs.readFileSync('uniq-domains.txt', 'utf-8');
var domains = txt.split("\n");
for(var i in domains){
  domain = domains[i].trim();
  if(domain == ''){
    continue;
  }
  bagpipe.push({url: domain})
  }
}

bagpipe.clear();

setTimeout(addTask, 2000);

