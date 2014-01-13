/**
 * Created by Administrator on 14-1-13.
 */
var util = require("util");
var events = require("events");

/**
 * 构造器，传入限流值，设置异步调用最大并发数
 * Examples:
 * ```
 * var bagpipe = new RedisBagpipe(100);
 * bagpipe.push(fs.readFile, 'path', 'utf-8', function (err, data) {
 *   // TODO
 * });
 * ```
 * Events:
 * - `full`, 当活动异步达到限制值时，后续异步调用将被暂存于队列中。当队列的长度大于限制值的2倍或100的时候时候，触发`full`事件。事件传递队列长度值。
 * - `outdated`, 超时后的异步调用异常返回。
 * Options:
 * - `disabled`, 禁用限流，测试时用
 * - `refuse`, 拒绝模式，排队超过限制值时，新来的调用将会得到`TooMuchAsyncCallError`异常
 * - `timeout`, 设置异步调用的时间上线，保证异步调用能够恒定的结束，不至于花费太长时间
 * @param {Number} limit 并发数限制值
 * @param {Object} options Options
 */
var RedisBagpipe = function (redis , taskQueueKey , method, callback, limit, options) {
    events.EventEmitter.call(this);
    this.redis = redis;
    this.taskQueueKey = taskQueueKey;
    this.limit = limit;
    this.method = method;
    this.callback = callback;
    this.active = 0;
    this.queue = [];
    this.queueLength = 0;
    this.options = {
        disabled: false,
        timeout: null
    };
    if (typeof options === 'boolean') {
        options = {
            disabled: options
        };
    }
    options = options || {};
    for (var key in this.options) {
        if (options.hasOwnProperty(key)) {
            this.options[key] = options[key];
        }
    }
};

util.inherits(RedisBagpipe, events.EventEmitter);

RedisBagpipe.prototype.clear = function(){
    this.redis.del(this.mainKey , function(){});
}

/**
 * 推入方法，参数。最后一个参数为回调函数
 * @param {Function} method 异步方法
 * @param {Mix} args 参数列表，最后一个参数为回调函数。
 */
RedisBagpipe.prototype.push = function (method) {
    var that = this;
    var args = [].slice.call(arguments, 1);

    //弹出最后一个callback
    args.pop();

    // 队列长度也超过限制值时
    this.redis.rpush(this.taskQueueKey , JSON.stringify(args), function(err ,replies){
        if(err){
            console.dir('rpush error' +args.toString() +  err);
            return;
        }
        that.queueLength += 1;
        if (that.queueLength > 1) {
            that.emit('full', that.queueLength);
        }
        that.next();

    });

    return this;

};

/*!
 * 继续执行队列中的后续动作
 */
RedisBagpipe.prototype.next = function () {
    var that = this;
    if (that.active < that.limit ) {

        that.redis.lpop(that.taskQueueKey, function(err , replies){
            if(err){
                console.dir('rpush error' +  err);
                setTimeout(that.next , 1000);
                return;
            }
            that.queueLength -= 1;

            var args = JSON.parse(replies);
            that.run(that.method, args);

        });

    }
};

RedisBagpipe.prototype._next = function () {
    this.active--;
    this.next();
};

/*!
 * 执行队列中的方法
 */
RedisBagpipe.prototype.run = function (method, args) {
    var that = this;
    that.active++;

    var timer = null;
    var called = false;

    // inject logic
    args.push( function (err) {

        // if timeout, don't execute
        if (!called) {
            that._next();
            that.callback.apply(null, arguments);
        } else {
            // pass the outdated error
            if (err) {
                that.emit('outdated', err);
            }
        }
    });

    method.apply(null, args);
};

module.exports = RedisBagpipe;

