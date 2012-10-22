/**
 * redis keys:
 * survey:total:high   - 9-10 count
 * survey:total:low    - 0-6  count
 * survey:total:mid    - 7-8  count
 * survey:anwsers:id   - max anwser id
 * survey:anwser:[0-9] - anwser
 * survey:anwsers:low  - list
 * survey:anwsers:mid  - list
 * survey:anwsers:high - list
 */

var redisLib = require('redis'),
    util = require('underscore'),
    Flow = require('seq');


var Survey = function(config){
    this.config = config;
    this.redis = redisLib.createClient(config.redis.port, config.redis.host);
}

Survey.prototype._get_object = function(key, callback) {
    return this.redis.get(key, function(err, data){
        if (err) {
            console.error(err);
            callback(err, data);
        } else {
            if(data&&data!=='undefined'){
                try{
                    callback(null, JSON.parse(data));
                }catch(e){
                    callback(null, data)
                }
            }else{
                callback("Can't find the key[" + key + "]", null);
            }
        }
    });
};

Survey.prototype._save_object = function(key, value, callback) {
    console.log(key, value);
    return this.redis.set(key, JSON.stringify(value), function(err, data){
        console.error(data);
        if (err) {
            console.error(err);
            callback(err, data);
        } else {
            callback(null, value);
        }
    });
};

Survey.prototype._del_object = function(key, callback) {
    return this.redis.del(key, function(err, data){
        if (err) {
            console.error(err);
            callback(err, data);
        } else {
            callback(null, data);
        }
    });
};

Survey.prototype.save_anwser = function(anwser, callback){
    var self = this;
    if(anwser.score>10||anwser.score<0){
        callback(true, 'Invail score');
    }
    var now = Math.floor(new Date().getTime() / 1000);
    Flow([anwser])
    .seq(function(anwser){
        var seq = this;
        self.redis.incr('survey:anwsers:id', function(err, id){
            anwser.id = id;
            seq(null, anwser);
        });
    })
    .seq(function(anwser){
        var seq = this;
        if(anwser.score < 7){
            self.redis.zadd(['survey:anwsers:low', now, anwser.id], function(err, ok){
                self.redis.incr('survey:total:low', function(err, id){
                    seq(err, anwser);
                });
            });
        }else if(anwser.score < 9){
            self.redis.zadd(['survey:anwsers:mid', now, anwser.id], function(err, ok){
                self.redis.incr('survey:total:mid', function(err, id){
                    seq(err, anwser);
                });
            });
        }else{
            self.redis.zadd(['survey:anwsers:high', now, anwser.id], function(err, ok){
                self.redis.incr('survey:total:high', function(err, id){
                    seq(err, anwser);
                });
            });
        }
    })
    .seq(function(anwser){
        self._save_object('survey:anwser:' + anwser.id, anwser, callback)
    });
};

Survey.prototype.del_anwser = function(id, callback){
    var self = this;
    Flow()
    .seq(function(){
        self.get_anwser(id, this);
    })
    .seq(function(anwser){
        var seq = this;
        if(anwser.score < 7){
            self.redis.zrem(['survey:anwsers:low', anwser.id], function(err, ok){
                self.redis.decr('survey:total:low', function(err, id){
                    seq(err, anwser);
                });
            });
        }else if(anwser.score < 9){
            self.redis.zerm(['survey:anwsers:mid', anwser.id], function(err, ok){
                self.redis.decr('survey:total:mid', function(err, id){
                    seq(err, anwser);
                });
            });
        }else{
            self.redis.zerm(['survey:anwsers:high', anwser.id], function(err, ok){
                self.redis.decr('survey:total:high', function(err, id){
                    seq(err, anwser);
                });
            });
        }
    })
    .seq(function(anwser){
        self._del_object('survey:anwser:' + anwser.id, callback)
    });
};

Survey.prototype.get_anwser = function(id, callback){
    return this._get_object('survey:anwser:' + id, callback);
};

Survey.prototype.get_anwsers = function(type, callback) {//{{{
    var self = this;

    Flow()
        .seq(function(){
            self.redis.zrevrange(['survey:anwsers:' + type, 0, -1], this);
        })
        .flatten()
        .parEach(10, function(anwser_id, i){
            self.get_anwser(anwser_id, this.into('a' + i));
        })
        .seq(function(){
            //callback(null, util.toArray(this.vars));
            callback(null, util.compact(this.vars));
        });
};//}}}

Survey.prototype.get_nps = function(callback){
    var high = 0;
    var low = 0;
    var mid = 0
    var self = this;
    Flow()
    .seq(function(){
        var seq = this;
        self.redis.get('survey:total:high', function(err, count){
            if(err){
                count = 0;
            }
            high = count||0;
            seq(null, null);
        });
    })
    .seq(function(){
        var seq = this;
        self.redis.get('survey:total:low', function(err, count){
            if(err){
                count = 0;
            }
            low = count||0;
            seq(null, null);
        });
    })
    .seq(function(){
        var seq = this;
        self.redis.get('survey:total:mid', function(err, count){
            if(err){
                count = 0;
            }
            mid = count||0;
            seq(null, null);
        });
    })
    .seq(function(){
        return callback(null, {
            mid: mid,
            high: high,
            low: low
        });
    });
}



module.exports = Survey;
