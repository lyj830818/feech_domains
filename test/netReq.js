
var iconvLite = require('iconv-lite');
var cheerio = require('cheerio');
var netReq = require('../src/netReq').Req;

var R = new netReq();

//for(var i = 0 ; i< 100; ++i){
  //R.get('www.sina.com.cn',{timeout : 15000} ,function(err, resp, body){

  //R.get('http://www.baidu.com',{timeout : 15000} ,function(err, resp, body){
  //R.get('http://www.w3school.com.cn/jsref/jsref_parseInt.asp',{timeout : 15000} ,function(err, resp, body){
  R.get('http://www.cnblogs.com',{timeout : 15000} ,function(err, resp, body){
    console.dir(err);
    console.dir(resp);
    console.dir(resp.statusCode);

    body = iconvLite.decode(body, 'utf8');
    //console.dir(body)
    var $ = cheerio.load(body);

    $('a').each(function (i, ele) {
      console.log($(ele).attr('href'));
    });

  });
//}

process.on('uncaughtException', function(err){
  console.dir('Caught exception:' + err);
  console.log(err.stack)
    
});

//R.get('192.168.100.97',function(err, resp){});


