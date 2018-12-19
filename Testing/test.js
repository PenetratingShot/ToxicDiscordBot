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
    // Basic override command
    if (message.content === "!reset") {
        redisClient.hmset(message.guild.id, 'prefix', '!');
        redisClient.hmset(message.guild.id, 'modRole', 'Mod');
        redisClient.hmset(message.guild.id, 'adminRole', 'Admin');
        redisClient.hmset(message.guild.id, 'on', 'true');
        redisClient.hmset(message.guild.id, 'logChannel', '#mod-log');
    }
    redisClient.hgetall(message.guild.id, function(err, config) {

        const prefix = config.prefix;
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        const adminRole = message.member.roles.find(role => role.name === config.adminRole);
        const modRole = message.member.roles.find(role => role.name === config.modRole);
        const loggingChannel = message.guild.channels.find(channel => channel.name === config.logChannel);
        if (command === "showconfig") {
            if (!modRole) {
                return message.reply(`you don't have the necessary role ${config.modRole} for this command.`);
            }
            message.channel.send({embed: {
                    "title": "Settings for this guild",
                    "color": 12458242,
                    "description": `**Prefix:** ${config.prefix}\n**Moderator Role:** ${config.modRole}\n**Administrator Role:** ${config.adminRole}\n**Logging Channel:** ${config.logChannel}\n**On**: ${config.on}`,
                    "fields": [
                        {
                            "name": "Prefix",
                            "value": `**Description:** This setting sets the global prefix for all commands on your server.`
                        },
                        {
                            "name": "Moderator Role",
                            "value": `**Description:** The setting for changing the mod role. Only difference is kick command`
                        },
                        {
                            "name": "Administrator Role",
                            "value": `**Description:** The setting for changing any command or moderation tools.`
                        },
                        {
                            "name": "Toggle On/Off",
                            "value": "**Description:** This setting allows you control whether the main feature is on or off. This can be helpful for server admins because they don't have to deal with the bot is there are recurring errors."
                        }
                    ]
            }})
        }
        if (command === "setconfig") {
            if (!adminRole) {
                return message.reply(`you don't have the necessary role ${config.adminRole} for this command.`);
            }
            let setting = args[0];
            let value = args[1];
            
        }
    })
});

client.login(process.env.DISCORD);