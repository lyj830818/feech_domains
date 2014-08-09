
var iconvLite = require('iconv-lite');
var cheerio = require('cheerio');
var netReq = require('../src/netReq').Req;

var R = new netReq();

//for(var i = 0 ; i< 100; ++i){
  //R.get('www.sina.com.cn',{timeout : 15000} ,function(err, resp, body){

  R.get('http://liuxue.com',{timeout : 15000} ,function(err, resp, body){
    console.dir(err);
    console.dir(resp.statusCode);

    body = iconvLite.decode(body, 'utf8');
    var $ = cheerio.load(body);

    $('a').each(function (i, ele) {
      console.log($(ele).attr('href'));
    });

  });
//}

process.on('uncaughtException', function(err){
  console.dir('Caught exception:' + err);
    
});

//R.get('192.168.100.97',function(err, resp){});


