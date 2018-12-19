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

client.on('message', message => {
    redisClient.hgetall(message.guild.id, function(err, config) {
        redisClient.hexists(message.guild.id, 'prefix', function(err, obj) {
            if (obj === 1) {
                redisClient.hmset(message.guild.id, 'prefix', '!');
            } else {

            }
        });
        redisClient.hexists(message.guild.id, 'modRole', function(err, obj) {
            if (obj === 1) {
                redisClient.hmset(message.guild.id, 'modRole', 'Mod');
            } else {

            }
        });
        redisClient.hexists(message.guild.id, 'adminRole', function(err, obj) {
            if (obj === 1) {
                redisClient.hmset(message.guild.id, 'adminRole', 'Admin');
            } else {

            }
        });
        redisClient.hexists(message.guild.id, 'on', function(err, obj) {
            if (obj === 1) {
                redisClient.hmset(message.guild.id, 'on', 'true');
            } else {

            }
        });
        redisClient.hexists(message.guild.id, 'logChannel', function(err, obj) {
            if (obj === 1) {
                redisClient.hmset(message.guild.id, 'logChannel', '#mod-log');
            } else {

            }
        });
        const prefix = config.prefix;
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        const adminRole = config.adminRole;
        if (command === "showconfig") {
            message.channel.send(config.adminRole);
        }
    })
});

client.login(process.env.DISCORD);