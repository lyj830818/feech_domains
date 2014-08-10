/**
 * Created by Administrator on 14-1-9.
 */

var _ = require('underscore'),
	request = require('request');
  //hyperquest = require('hyperquest');
var net = require('net');
var parseDomain = require("parse-domain");
var urlParser = require('url');
var dns = require('node-dns');
var iconvLite = require('iconv-lite');

var _s = require('underscore.string');

var bufSearch = require('buffer-search');
var zlib = require('zlib');

var req_id = 0;
function Req(headers) {

	this.userAgents = [
		"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)",
		"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1",
		"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; Media Center PC 6.0)",
		"Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1",
		"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.94 Safari/537.36",
		"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET4.0C; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; InfoPath.1)",
		"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0)",
		"NokiaE72-1/071.004 (SymbianOS/9.3; U; Series60/3.2 Mozilla/5.0; Profile/MIDP-2.1 Configuration/CLDC-1.1; Baidu Transcoder) AppleWebKit/533.4 (KHTML, like Gecko) Version/3.0 NokiaBrowser/7.3.1.26 3gpp-gba",
		"Mozilla/5.0 (iPad; CPU OS 6_1_3 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B176",
		"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C)",
		"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET4.0C; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; InfoPath.1)",
		"Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; BRI/2; MASM; InfoPath.2; .NET4.0C; SE 2.X MetaSr 1.0)",
		"Mozilla/5.0 (Linux; U; Android 4.1.2; zh-CN; L36h Build/10.1.1.A.1.253) AppleWebKit/534.31 (KHTML, like Gecko) UCBrowser/9.0.0.288 U3/0.8.0 Mobile Safari/534.31",
		"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 1.1.4322)",
		"Mozilla/5.0 (iPad; CPU OS 6_1_3 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B176",
		"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 1.1.4322)",
		"Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.92 Safari/537.1 LBBROWSER",
		"Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0)",
		"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1",
		"Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.1 (KHTML, like Gecko) Maxthon/3.0 Chrome/22.0.1229.79 Safari/537.1",
		"Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.43 BIDUBrowser/2.x Safari/537.31",
		"Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1",
		"Mozilla/5.0 (iPhone; CPU iPhone OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3",
		"Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_3 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Mobile/10B329 baiduboxapp/0_0.0.2.4_enohpi_069_046/3.1.6_1C2%254enohPi/1099a/307e001529c05a1a3c503f9286a4ca8f/1",
		"Mozilla/5.0 (iPad; CPU OS 5_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A405 Safari/7534.48.3",
		"Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/6.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; SE 2.X MetaSr 1.0)",
		"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17 SE 2.X MetaSr 1.0",
		"Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1",
		"Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_2 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A551 Safari/8536.25",
		"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; InfoPath.2)",
		"Mozilla/5.0 (iPad; CPU OS 6_1_3 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3"
	];

	var defaultHeaders = {
		'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Encoding' : 'gzip,deflate',
		'Accept-Language':'en-us,en;q=0.5',
		'Accept-Charset' : '',
		'Cache-Control' : 'no-cache',
		'Pragma' : 'no-cache',
		'Referer' : 'http://www.google.com',
		'Connection': 'close'
		//'Connection': 'Keep-Alive'
	};
	this.headers = _.extend({}, defaultHeaders, headers);

}
exports.Req = Req;

function hostname(url){
	var dmInfo = parseDomain(url);
	console.dir(dmInfo);
	if(dmInfo == null){
		return;
	}
	//logger.debug(dmInfo);
	var rootDomain = dmInfo.domain + '.' + dmInfo.tld;
	var wholeDomain = rootDomain;
	if(dmInfo.subdomain){
		var wholeDomain = dmInfo.subdomain + '.' + wholeDomain;
	}
}

function normalizeUrl(url){
	if(url.indexOf('http') !== 0){
		url = 'http://' + url;
	}
	return url;
}

function headerStr(dict){
	var arr = [];
	for(var key in dict){
		arr.push(key + ':' + dict[key]);
	}
	return arr.join("\x0d\x0a");
}

function build_buffer(arr){
	var bs = [];
	var size = 0;
	for(var i = 0; i < arr.length; i++){
		var arg = arr[i];
		if(arg instanceof Buffer){
			//
		}else{
			arg = new Buffer(arg.toString());
		}
		bs.push(arg);
		size += arg.length;
	}
	var ret = new Buffer(size);
	var offset = 0;
	for(var i=0; i<bs.length; i++){
		bs[i].copy(ret, offset);
		offset += bs[i].length;
	}
	return ret;
}

function parseRespHeaders(raw){
  var lines = raw.split("\x0d\x0a");
  var res = {};
  var arr;
  _.each(lines ,function(line){
    arr = line.split(":");
    res[_s.trim(arr[0]).toLowerCase()] = _s.trim(arr[1]).toLowerCase();
  });
  return res;
}

function collcetChunk(respBody){
	var respBuf = '';
  var chunkLen = 0;
  var end;
  var start = 0;
   // console.log('------body length ----');
  //console.dir(respBody.length);

  /*
  var idx = 0;
     end= bufSearch(respBody , new Buffer("\x0d\x0a") , start);
     var ch =respBody.slice(start , end).toString('utf-8');
    console.log('------1111 ----');
    console.log('------ch ----');
     console.dir(ch);
     chunkLen = parseInt(respBody.slice(start , end).toString('utf-8'), 16);
     respBuf = build_buffer([respBuf , respBody.slice( end + 2, end + 2 + chunkLen) ]);
    console.log('------end----');
     console.dir(end);
    console.log('------chunk len----');
     console.dir(chunkLen);



     start = end + 2 + chunkLen + 2;
     end= bufSearch(respBody , new Buffer("\x0d\x0a") , start);
     var ch =respBody.slice(start , end).toString('utf-8');
    console.log('------222 ----');
    console.log('------ch ----');
     console.dir(ch);
     chunkLen = parseInt(respBody.slice(start , end), 16);
     respBuf = build_buffer([respBuf , respBody.slice( end + 2, end + 2 + chunkLen) ]);
    console.log('------end----');
     console.dir(end);
    console.log('------chunk len----');
     console.dir(chunkLen);


     start = end + 2 + chunkLen + 2;
     end= bufSearch(respBody , new Buffer("\x0d\x0a") , start);
     var ch =respBody.slice(start , end).toString('utf-8');
    console.log('------33333 ----');
     console.dir(ch);
     chunkLen = parseInt(respBody.slice(start , end), 16);
     respBuf = build_buffer([respBuf , respBody.slice( end + 2, end + 2 + chunkLen) ]);
     console.dir(end);
     console.dir(chunkLen);


    console.log('------buf length ----');
     console.dir(respBuf.length);
     process.exit();
    */

  while(1){
     end= bufSearch(respBody , new Buffer("\x0d\x0a") , start);
   //  console.dir('---------end---------')
   //  console.dir(end);
     chunkLen = parseInt(respBody.slice(start , end), 16);
  //   console.dir('---------chunklen---------')
  //   console.dir(chunkLen);
     if(chunkLen == 0){
       break;
     }

     respBuf = build_buffer([respBuf , respBody.slice( end + 2, end + 2 + chunkLen) ]);

     start = end + 2 + chunkLen + 2; //end + \r\n + chunk + \r\n
  }
  //console.dir(respBuf.length);
  return respBuf;

}

function sendHttp(ip , port , path, headers, options, cb ){
	port = port || 80;
	headers = headerStr(headers);
	var timeout = options.timeout || 0;
	var bufferStr = "GET " + path + " HTTP/1.1" + "\x0d\x0a" +
		headers + "\x0d\x0a" + "\x0d\x0a";

	var buffer = build_buffer([bufferStr]);
	var cbErr = "";

	//console.dir(ip);
	//console.dir(port);
	var client = new net.Socket();
	var respBuf = '';
	var startTime = new Date();
	client.connect( port, ip, function() {

		//console.log('CONNECTED TO: ' + ip + ':' + port);
		// 建立连接后立即向服务器发送数据，服务器将收到这些数据
		client.write(buffer , null , function(){
			//console.dir('buffer write successfully');
		});

	})
	client.setTimeout(timeout ,function(){
		cbErr = "NetReq Timeout Emitted";
		cb(cbErr);
		client.destroy();
		return;
	})
	client.on('drain' , function(data){
		console.log('buffer is full');
	});
	client.on('data', function(data ){
		//console.log('--------recieve data----------');
		//console.dir(data);
		respBuf = build_buffer([respBuf , data]);
		//console.log('--------end recieve data----------');
	});
	client.on('end', function(){
		var endTime = new Date();

		//console.log('socket is end');
		console.dir('time spent: ' + (endTime - startTime));
		//var resp = iconvLite.decode(respBuf, 'utf8');
    
		var headend = bufSearch(respBuf , new Buffer("\x0d\x0a\x0d\x0a") , 0);
		var headBuf = respBuf.slice(0 , headend);
		//console.dir( iconvLite.decode(headBuf, 'utf8'));
		//console.dir(headend);
//		//resp = resp.split("\x0d\x0a\x0d\x0a");
		var respHeader = {};
		respHeader.raw = _s.trim(iconvLite.decode(headBuf, 'utf8'));
    respHeader.headers = parseRespHeaders(respHeader.raw);
		respHeader.statusCode = parseInt(respHeader.raw.substring(9 , 12));
		var respBody = respBuf.slice(headend + 4);

    //console.dir(respHeader)
    if(respHeader.headers['transfer-encoding'] == 'chunked'){
      respBody = collcetChunk(respBody);
    }


    if(respHeader.headers['content-encoding'] == 'gzip'){
      zlib.gunzip(respBody , function(err , buf){
        console.dir(err);
        respBody = buf;
        cb(cbErr, respHeader, respBody);
        return;
      });
    }else if(respHeader.headers['content-encoding'] == 'deflate'){
      zlib.inflate(respBody , function(err , buf){
        respBody = buf;
        cb(cbErr, respHeader, respBody);
        return;
      });
    }

    cb(cbErr, respHeader, respBody);
    return;
    

	});

	client.on('error' , function(err){
		//console.dir('error event:' + err);
		cb(err);
	});
	client.on('close' , function(had_error){
		//console.dir('close event:' + had_error);
	});


}
Req.prototype.get = function (url, option, cb) {
	var that = this;
	this.option = option;

	if (!this.headers['user-agent']) {
		//this.headers['user-agent'] = this.userAgents[_.random(0, this.userAgents.length)];
		this.headers['user-agent'] = this.userAgents[1];
	}

	var urlFragment = urlParser.parse(normalizeUrl(url));

	var domain  = urlFragment.host.split(':')[0];
	if(net.isIP(domain)){
		sendHttp(domain , urlFragment.port, urlFragment.path, this.headers, this.option , cb);
	}

	//domain = 'baidu.com';
	dns.resolve(domain, 'A', function (err, results) {
		if(err){
			cb(err);
			return;
		}
		if(results === undefined){
			cb('dns result undefined');
			return;
		}
		console.log("---- DNS Direct Request ----");
		console.dir(results);
		console.log("------------------------");

		var ip = results[0];
		//ip = '192.168.100.97';
		//domain = 'wp391.com';
		that.headers['Host'] = domain;
		//console.dir(that.headers);
		sendHttp( ip , urlFragment.port,urlFragment.path, that.headers,
			that.option ,cb );

	});


};
