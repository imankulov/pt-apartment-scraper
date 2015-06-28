var redis = require("redis"),
    through2 = require("through2");


/**
 * A transformer which only passes through not-seen-yet objects
 */
RedisFilter = through2.ctor(
    {objectMode: true},

    function(chunk, enc, cb) {
        var transformer = this;
        this.client = this.client || redis.createClient();
        this.client.sadd("urls:seen", chunk.link, function(err, reply){
            if (reply) {
                transformer.push(chunk);
            }
            cb();
        });
    },

    function(cb) {
        this.client && this.client.quit();
        cb();
    }
);

exports.RedisFilter = RedisFilter;
