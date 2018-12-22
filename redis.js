const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('error', function(err) {
    console.log('Something went wrong: ', err);
});

redisClient.hmset('02-34892', 'prefix', '!');
redisClient.hmset('02-34892', 'modRole', 'Mod');
redisClient.hmset('02-34892', 'adminRole', 'Admin');
redisClient.hmset('02-34892', 'on', 'true');
redisClient.hmset('02-34892', 'logChannel', 'mod-log');

console.log(redisClient.hget('02-34892', 'prefix'));