var config = require('./config').vbox,
  redis = require('redis'),
  _ = require('underscore'),
  fs = require('fs'),
  utils = require('./src/utils.js'),
  RedisBagpipe = require('./src/observer-redis-bagpipe');


var redisClient = redis.createClient(config.redis.port, config.redis.host);

var bagpipe = new RedisBagpipe(redisClient, 'task_queue_key',
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

setTimeout(addTask, 2000);

