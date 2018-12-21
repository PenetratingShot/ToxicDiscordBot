const Discord = require('discord.js');
require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 15;
const client = new Discord.Client;
const redis = require('redis');
const redisClient = redis.createClient();

client.on('guildCreate', guild => {
    console.log(`Joined a new guild with id: ${guild.id}`);
    redisClient.hmset(guild.id, 'prefix', '!');
    redisClient.hmset(guild.id, 'modRole', 'Mod');
    redisClient.hmset(guild.id, 'adminRole', 'Admin');
    redisClient.hmset(guild.id, 'on', 'true');
    redisClient.hmset(guild.id, 'logChannel', '#mod-log');
});

client.on('ready', () => {
    console.log('It works I guess..');
    client.user.setActivity(`!help for help`);
    client.user.setStatus('dnd');
});

redisClient.on('connect', () => {
    console.log('Connected to Redis :)');
});

redisClient.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

client.on("message", message => {
    redisClient.hgetall(message.guild.id, function (err, result) {
        const prefix = result.prefix;
        if (message.content === "!yes") {
            message.channel.send(prefix);
        }
    });
});

client.login(process.env.DISCORD);