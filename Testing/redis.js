const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('error', function(err) {
    console.log('Something went wrong: ', err);
});

redisClient.hset('02-34892', 'prefix', '!');
redisClient.hset('02-34892', 'modRole', 'Mod');
redisClient.hset('02-34892', 'adminRole', 'Admin');
redisClient.hset('02-34892', 'on', 'true');
redisClient.hset('02-34892', 'logChannel', 'mod-log');

redisClient.hgetall('02-34892', function (err, result) {
    console.log(JSON.stringify(result.prefix));
});