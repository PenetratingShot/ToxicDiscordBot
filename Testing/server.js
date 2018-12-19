// - Add role command
// - Add kick user from voice channel command
// Allow Admins to remove certain permissions for a specific user
// - Add funny "banned" image after ban

const Discord = require("discord.js");
require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 15;
const client = new Discord.Client;
const Perspective = require('perspective-api-client');
const perspective = new Perspective({apiKey: process.env.PERSPECTIVE1})
const delay = require('delay');
const antispam = require('discord-anti-spam');
const fs = require('fs');
const StringBuilder = require('string-builder');
let sb = new StringBuilder();
const defaultSettings = require('./json/default.json');
const shell = require('shelljs');
const express = require('express');
const app = express();
const fileExists = require('file-exists');
const redis = require('redis');
const redisClient = redis.createClient();

client.on("guildDelete", guild => {
    client.settings.delete(guild.id);

});

/*client.on("guildMemberAdd", member => {
    client.settings.ensure(member.guild.id, defaultSettings);

    let welcomeMessage = client.settings.get(member.guild.id, "welcomeMessage");

    welcomeMessage = welcomeMessage.replace("{{user}}", member.user.tag)

    member.guild.channels
        .find("name", client.settings.get(member.guild.id, "welcomeChannel"))
        .send(welcomeMessage)
        .catch(console.error);
});*/

const http = require('http');
app.get("/", (request, response) => {
  console.log(Date.now() + " Dood it just got pinged.");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

// When bot joins a guild
client.on("guildCreate", guild => {
    console.log(`Joined a new guild: ` + guild.name + guild.id);
    shell.cd('json');
    shell.cp('default.json', `${guild.id}` + '.json');
    redisGetSet();
});

client.on('ready', () => {
    console.log('It works I guess..');
    client.user.setActivity(`!help for help`);
    client.user.setStatus('dnd');
});

client.on('message', async message => {
    redisClient.hgetall(message.guild.id, function (err, result) {
        //let rawdata = fs.readFileSync(`./json/${message.guild.id}.json`);
        let config = result;
        const adminRole = message.member.roles.find(role => role.name === config.adminRole);
        const modRole = message.member.roles.find(role => role.name === config.modRole);
        const loggingChannel = message.guild.channels.find(channel => channel.name === config.logChannel);
        const prefix = config.prefix;
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if (message.author.bot) return;

        /*antispam(client, {
            warnBuffer: config.warnBuffer, //Maximum amount of messages allowed to send in the interval time before getting warned.
            maxBuffer: config.maxBuffer, // Maximum amount of messages allowed to send in the interval time before getting banned.
            interval: config.interval, // Amount of time in ms users can send a maximum of the maxBuffer variable before getting banned.
            warningMessage: config.warningMessage, // Warning message send to the user indicating they are going to fast.
            banMessage: config.banMessage, // Ban message, always tags the banned user in front of it.
            maxDuplicatesWarning: config.maxDuplicatesWarning,// Maximum amount of duplicate messages a user can send in a timespan before getting warned
            maxDuplicatesBan: config.maxDuplicatesBan, // Maximum amount of duplicate messages a user can send in a timespan before getting banned
            deleteMessagesAfterBanForPastDays: config.deleteMessagesAfterBanForPastDays // Delete the spammed messages after banning for the past x days.
        });*/

        if (command === 'help') {
            const embed = new Discord.RichEmbed()
            .setTitle("Toxicity Help Section")
            .setColor(936362)
            .setDescription(`**Setup:**\nYou need to do some things before this bot can be fully operational.\n- you need to create a dummy role called 'Admin' and assign it to administrators\n- make sure that the bot has administrator permissions (don't uncheck the box)\n- make sure that the bot has a role higher than those of the people it has to moderate (otherwise it won't work)\n\n**Commands**\n!help: sends the help section to the person who requested it\n!purge [number]: purges a specified number of messages from the chat\n!kick [mention]: kicks a mentioned user from the server\n!ban [mention]: bans a mentioned user from the server`)

            message.author.send(embed);
        }
        else if (command === "reset") {
            redisClient.hmset(message.guild.id, 'prefix', '!');
            redisClient.hmset(message.guild.id, 'modRole', 'Mod');
            redisClient.hmset(message.guild.id, 'adminRole', 'Admin');
            redisClient.hmset(message.guild.id, 'on', 'true');
            redisClient.hmset(message.guild.id, 'logChannel', '#mod-log');
        }
        else if (command === "showconf") {
            try {
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
                }});
                /*if (fs.existsSync('./json/' + message.guild.id + '.json')) {
                    message.channel.send({embed: {
                        "title": "Settings for this Guild",
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
                }*/
            } catch (err) {
                console.log(err);
            }
        }
        else if (command === "setconf") {
            if(!adminRole) {
                return message.reply(`you don't have the necessary role ${config.adminRole} for this command.`);
            }
            let setting = args[0];
            let value = args[1];

            if (!setting) return message.reply(`you need to supply the setting that you want to change. The command is: ${config.prefix}setconf [setting] [value]. Note that you can only change one setting at a time.`);
            if (!value) return message.reply(`you need to supply the value of the setting that you want to change. The command is: ${config.prefix}setconf [setting] [value]. Note that you can only change one setting at ae time.`);

            /*shell.cd('json');
            shell.cp(`${message.guild.id}.json`, `${message.guild.id}1.json`);
            let rawdata1 = fs.readFileSync(`./json/${message.guild.id}1.json`);
            let config1 = JSON.parse(rawdata1);*/

            if (setting === "prefix") {

            }
            else if (setting === "modRole") {

            }
            else if (setting === "adminRole") {

            }
            else if (setting === "on") {

            }
            else {
                message.reply(`the argument you entered is not a valid setting. Try the command ${config.prefix}showconf to see the available commands.`);
            }
        }
        else if (command === "kick") {
            if(!modRole) {
                return message.reply(`you don't have the necessary role ${config.modRole} for this command.`);
            }

        let member = message.mentions.members.first() || message.guild.members.get(args[0]);
        if(!member)
            return message.reply("Fatal: You must mention a valid member on this server. Please try again.");
        if(!member.kickable)
            return message.reply("Unable to kick user. Make sure that I have the necessary perms and that my role is above theirs in the role hierarchy.");

        let reason = args.slice(1).join(' ');
        if(!reason) reason = "No reason provided by Admins.";
    
        member.kick(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of: ${error}`));
            message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
        }
        else if (command === "ban") {
            if(!adminRole) {
                return message.reply(`you don't have the necessary role ${config.adminRole} for this command.`);
            }
    
        let member = message.mentions.members.first();
        if (!member)
            return message.reply("Fatal: You must mention a valid member on this server. Please try again.");
        if (!member.bannable)
            return message.reply("Unable to ban user. Make sure that I have the necessary perms and that my role is above theirs in the role hierarchy.");
        let reason = args.slice(1).join(' ');
        if (!reason) reason = "No reason provided by Admins.";
    
        member.ban(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of: ${error}`));
        message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
        }
        else if (command === "mute") {
            if(!adminRole) {
                return message.reply(`you don't have the necessary role ${config.adminRole} for this command.`);
            }
            let user = message.mentions.users.first();
            if(!user) return message.reply("Couldn't find user.");
            if(user.hasPermission("MANAGE_MESSAGES")) return message.reply("Can't mute them!");
            let mutedRole = message.guild.roles.find(`name`, "ToxicBotMutedRole");
            //start of create role
            if(!mutedRole){
                try{
                    mutedRole = message.guild.createRole({
                        name: "ToxicBotMutedRole",
                        color: "#000000",
                        permissions:[]
                    })
                    message.guild.channels.forEach(async (channel, id) => {
                        await channel.overwritePermissions(muterole, {
                            SEND_MESSAGES: false,
                            ADD_REACTIONS: false
                        });
                    });
                }catch(e){
                    console.log(e.stack);
                }
            }
            //end of create role
            let mutetime = args[1];
            if(!mutetime) return message.reply("You didn't specify a time!");

            await(user.addRole(muterole.id));
            message.reply(`<@${user.id}> has been muted for ${mutetime}`);

            setTimeout(function(){
                user.removeRole(mutedRole.id);
                message.channel.send(`<@${user.id}> has been unmuted!`);
            }, (mutetime));
        }
        else if (command === "purge") {
            const deleteCount = parseInt(args[0], 10);

            if(!deleteCount || deleteCount < 2 || deleteCount > 100)
                return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

            const fetched = message.channel.fetchMessages({limit: deleteCount});
            message.channel.bulkDelete(fetched)
                .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
        }
        else {
            if (config.on === "false") {

            } else {
                const vowels = ["a", "e", "i", "o", "u", "y"];
                if (vowels.some(word => message.content.includes(word))) {
                    const text = message.content;
                    (async () => {
                        const result = await perspective.analyze(text, {attributes: ['toxicity', 'severe_toxicity', 'identity_attack', 'insult', 'profanity', 'sexually_explicit', 'threat', 'flirtation', 'attack_on_author', 'attack_on_commenter']});
                        const v1 = `${result.attributeScores.TOXICITY.summaryScore.value}`;
                        const v4 = `${result.attributeScores.INSULT.summaryScore.value}`;
                        const v5 = `${result.attributeScores.PROFANITY.summaryScore.value}`;
                        const v6 = `${result.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value}`;
                        const v7 = `${result.attributeScores.THREAT.summaryScore.value}`;

                        if (v1 > 0.5 || v4 > 0.5 || v6 > 0.5 || v7 > 0.5) {
                            sb.clear();
                            if (v1 > 0.5) sb.append('*Toxicity*  ');
                            if (v4 > 0.5) sb.append('*Insult*  ');
                            if (v5 > 0.5) sb.append('*Profanity*  ');
                            if (v6 > 0.5) sb.append('*Sexually Explicit*  ');
                            if (v7 > 0.5) sb.append('*Threat*  ');

                            message.delete();
                            message.reply(`your message was deleted for the following reasons: ${sb.toString()}`);
                            fs.writeFile('./json/reasons.json', `{ "reasons": "${sb.toString()}" }`, function (err) {
                                if (err) throw err;
                            });
                        }

                    })();
                }
                else {
                    //no u
                }
            }
        }
        });
    });

client.on("messageDelete", (message) => {
    let rawdata = fs.readFileSync(`./json/${message.guild.id}.json`);
    let config = JSON.parse(rawdata);
    let rawdata2 = fs.readFileSync('./json/reasons.json');
    let data2 = JSON.parse(rawdata2);
    message.guild.channels.find("name", "mod-log").send({embed: {
            "title": `<:messagedelete:439643744833241101> Message Deleted`,
            "timestamp": new Date(),
            "footer": {
                "icon_url": `${message.author.avatarURL}`,
                "text": `${message.author.tag}`
            },
            "color": 293173,
            "description": `• **Channel:** ${message.channel}\n• **Message:** ${message.content}\n• **Author:** ${message.author}\n• **Reason(s):** ${data2.reasons}`
    }});
});

client.login(process.env.DISCORD);

// Invite Link: https://discordapp.com/oauth2/authorize?client_id=502129538797404160&scope=bot&permissions=8
