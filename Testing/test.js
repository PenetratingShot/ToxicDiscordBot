const Discord = require('discord.js');
require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 15;
const client = new Discord.Client;
const Perspective = require('perspective-api-client');
const perspective = new Perspective({apiKey: process.env.PERSPECTIVE1})
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

client.on("message", message => {
    redisClient.hgetall(message.guild.id, function (err, result) {
        if (err) throw err;
        if (message.content === "!prefixpls") {
            message.channel.send(result.prefix);
        }
    })
});

client.login(process.env.DISCORD);