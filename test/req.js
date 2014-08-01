/**
 * Created by Administrator on 14-1-9.
 */

var config = require('../config').aliyun,
should = require('chai').should(),
req = require('../src/Req'),
iconvLite = require('iconv-lite'),
cheerio = require('cheerio');


var url = "http://www.hao123.com";
var R = new req.Req();
R.get(url, {}, function (err, response, body) {
  console.dir(err);
  console.log(body);
  body = iconvLite.decode(body, 'utf8');
  var $ = cheerio.load(body);

  $('a').each(function (i, ele) {
    //console.log($(ele).attr('href'));
  });


});
