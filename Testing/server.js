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
});


client.on('ready', () => {
    console.log('It works I guess..');
    client.user.setActivity(`!help for help`);
    client.user.setStatus('dnd');
});

client.on('message', async message => {
    let rawdata = fs.readFileSync(`./json/${message.guild.id}.json`);
    let config = JSON.parse(rawdata);
    const adminRole = message.member.roles.find(role => role.name === config.adminRole);
    const modRole = message.member.roles.find(role => role.name === config.modRole);
    const prefix = config.prefix;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (message.author.bot) return;

    antispam(client, {
        warnBuffer: config.warnBuffer, //Maximum amount of messages allowed to send in the interval time before getting warned.
        maxBuffer: config.maxBuffer, // Maximum amount of messages allowed to send in the interval time before getting banned.
        interval: config.interval, // Amount of time in ms users can send a maximum of the maxBuffer variable before getting banned.
        warningMessage: config.warningMessage, // Warning message send to the user indicating they are going to fast.
        banMessage: config.banMessage, // Ban message, always tags the banned user in front of it.
        maxDuplicatesWarning: config.maxDuplicatesWarning,// Maximum amount of duplicate messages a user can send in a timespan before getting warned
        maxDuplicatesBan: config.maxDuplicatesBan, // Maximum amount of duplicate messages a user can send in a timespan before getting banned
        deleteMessagesAfterBanForPastDays: config.deleteMessagesAfterBanForPastDays // Delete the spammed messages after banning for the past x days.
    });

    if (command === 'help') {
      const embed = new Discord.RichEmbed()
        .setTitle("Toxicity Help Section")
        .setColor(936362)
        .setDescription(`**Setup:**\nYou need to do some things before this bot can be fully operational.\n- you need to create a dummy role called 'Admin' and assign it to administrators\n- make sure that the bot has administrator permissions (don't uncheck the box)\n- make sure that the bot has a role higher than those of the people it has to moderate (otherwise it won't work)\n\n**Commands**\n!help: sends the help section to the person who requested it\n!purge [number]: purges a specified number of messages from the chat\n!kick [mention]: kicks a mentioned user from the server\n!ban [mention]: bans a mentioned user from the server`)

      message.author.send(embed);
    }
    else if (command === "showconf") {
        try {
            if (fs.existsSync('./json/' + message.guild.id + '.json')) {
                message.channel.send({embed: {
                    "title": "Settings for this Guild",
                    "color": 12458242,
                    "description": `**Prefix:** ${config.prefix}\n**Moderator Role:** ${config.modRole}\n**Administrator Role:** ${config.adminRole}`,
                    "fields": [
                        {
                            "name": "Prefix",
                            "value": `**Description:** This setting sets the global prefix for all commands on your server.\nThe current server prefix is: **${config.prefix}**`
                        },
                        {
                            "name": "Moderator Role",
                            "value": `**Description:** The setting for changing the mod role. Only difference is kick command\nThe current moderator role is: **${config.modRole}**`
                        },
                        {
                            "name": "Administrator Role",
                            "value": `**Description:** The setting for changing any command or moderation tools.\nThe current Administrator Role is: **${config.adminRole}**`
                        }
                    ]
                }})
            }
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

        if (!setting) return message.reply(`you need to supply the setting that you want to change. The command is: ${config.prefix}setconf [setting] [value]. Note that you can only change one setting at ae time.`);
        if (!value) return message.reply(`you need to supply the value of the setting that you want to change. The command is: ${config.prefix}setconf [setting] [value]. Note that you can only change one setting at ae time.`);

        /*shell.cd('json');
        shell.cp(`${message.guild.id}.json`, `${message.guild.id}1.json`);
        let rawdata1 = fs.readFileSync(`./json/${message.guild.id}1.json`);
        let config1 = JSON.parse(rawdata1);*/

        if (setting === "prefix") {
            if (value === config.prefix) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${value}", "modRole": "${config.modRole}", "adminRole": "${config.adminRole}, "warnBuffer": "${config.warnBuffer}", "maxBuffer": "${config.maxBuffer}", "interval": "${config.interval}", "warningMessage": "${config.warningMessage}", "banMessage": "${config.banMessage}", "maxDuplicatesWarning": "${config.maxDuplicatesWarning}", "maxDuplicatesBan": "${config.maxDuplicatesBan}", "deleteMessagesAfterBanForPastDays": "${config.deleteMessagesAfterBanForPastDays}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed prefix to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
        else if (setting === "modRole") {
            if (value === config.modRole) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${value}", "adminRole": "${config.adminRole}, "warnBuffer": "${config.warnBuffer}", "maxBuffer": "${config.maxBuffer}", "interval": "${config.interval}", "warningMessage": "${config.warningMessage}", "banMessage": "${config.banMessage}", "maxDuplicatesWarning": "${config.maxDuplicatesWarning}", "maxDuplicatesBan": "${config.maxDuplicatesBan}", "deleteMessagesAfterBanForPastDays": "${config.deleteMessagesAfterBanForPastDays}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Moderator Role to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
        else if (setting === "adminRole") {
            if (value === config.adminRole) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${config.modRole}", "adminRole": "${value}, "warnBuffer": "${config.warnBuffer}", "maxBuffer": "${config.maxBuffer}", "interval": "${config.interval}", "warningMessage": "${config.warningMessage}", "banMessage": "${config.banMessage}", "maxDuplicatesWarning": "${config.maxDuplicatesWarning}", "maxDuplicatesBan": "${config.maxDuplicatesBan}", "deleteMessagesAfterBanForPastDays": "${config.deleteMessagesAfterBanForPastDays}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Administrator Role to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
        else if (setting === "warnBuffer") {
            if (value === config.warnBuffer) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${config.modRole}", "adminRole": "${config.adminRole}, "warnBuffer": "${value}", "maxBuffer": "${config.maxBuffer}", "interval": "${config.interval}", "warningMessage": "${config.warningMessage}", "banMessage": "${config.banMessage}", "maxDuplicatesWarning": "${config.maxDuplicatesWarning}", "maxDuplicatesBan": "${config.maxDuplicatesBan}", "deleteMessagesAfterBanForPastDays": "${config.deleteMessagesAfterBanForPastDays}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Warn Buffer to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
        else if (setting === "maxBuffer") {
            if (value === config.maxBuffer) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${config.modRole}", "adminRole": "${config.adminRole}, "warnBuffer": "${config.warnBuffer}", "maxBuffer": "${value}", "interval": "${config.interval}", "warningMessage": "${config.warningMessage}", "banMessage": "${config.banMessage}", "maxDuplicatesWarning": "${config.maxDuplicatesWarning}", "maxDuplicatesBan": "${config.maxDuplicatesBan}", "deleteMessagesAfterBanForPastDays": "${config.deleteMessagesAfterBanForPastDays}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Max Buffer to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
        else if (setting === "interval") {
            if (value === config.interval) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${config.modRole}", "adminRole": "${config.adminRole}, "warnBuffer": "${config.warnBuffer}", "maxBuffer": "${config.maxBuffer}", "interval": "${value}", "warningMessage": "${config.warningMessage}", "banMessage": "${config.banMessage}", "maxDuplicatesWarning": "${config.maxDuplicatesWarning}", "maxDuplicatesBan": "${config.maxDuplicatesBan}", "deleteMessagesAfterBanForPastDays": "${config.deleteMessagesAfterBanForPastDays}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Interval Time to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
        else if (setting === "warningMessage") {
            if (value === config.warningMessage) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${config.modRole}", "adminRole": "${config.adminRole}, "warnBuffer": "${config.warnBuffer}", "maxBuffer": "${config.maxBuffer}", "interval": "${config.interval}", "warningMessage": "${value}", "banMessage": "${config.banMessage}", "maxDuplicatesWarning": "${config.maxDuplicatesWarning}", "maxDuplicatesBan": "${config.maxDuplicatesBan}", "deleteMessagesAfterBanForPastDays": "${config.deleteMessagesAfterBanForPastDays}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Warning Message to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
        else if (setting === "banMessage") {
            if (value === config.banMessage) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${config.modRole}", "adminRole": "${config.adminRole}, "warnBuffer": "${config.warnBuffer}", "maxBuffer": "${config.maxBuffer}", "interval": "${config.interval}", "warningMessage": "${config.warningMessage}", "banMessage": "${value}", "maxDuplicatesWarning": "${config.maxDuplicatesWarning}", "maxDuplicatesBan": "${config.maxDuplicatesBan}", "deleteMessagesAfterBanForPastDays": "${config.deleteMessagesAfterBanForPastDays}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Ban Message to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
        else if (setting === "maxDuplicatesWarning") {
            if (value === config.maxDuplicatesWarning) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${config.modRole}", "adminRole": "${config.adminRole}, "warnBuffer": "${config.warnBuffer}", "maxBuffer": "${config.maxBuffer}", "interval": "${config.interval}", "warningMessage": "${config.warningMessage}", "banMessage": "${config.banMessage}", "maxDuplicatesWarning": "${value}", "maxDuplicatesBan": "${config.maxDuplicatesBan}", "deleteMessagesAfterBanForPastDays": "${config.deleteMessagesAfterBanForPastDays}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Max Duplicates Warning to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
        else if (setting === "maxDuplicatesBan") {
            if (value === config.maxDuplicatesBan) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${config.modRole}", "adminRole": "${config.adminRole}, "warnBuffer": "${config.warnBuffer}", "maxBuffer": "${config.maxBuffer}", "interval": "${config.interval}", "warningMessage": "${config.warningMessage}", "banMessage": "${config.banMessage}", "maxDuplicatesWarning": "${config.maxDuplicatesWarning}", "maxDuplicatesBan": "${value}", "deleteMessagesAfterBanForPastDays": "${config.deleteMessagesAfterBanForPastDays}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Max Duplicates Ban to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
        else if (setting === "deleteMessagesAfterBanForPastDays") {
            if (value === config.deleteMessagesAfterBanForPastDays) {
                message.reply('that key is already stored in the config.')
            }
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${config.modRole}", "adminRole": "${config.adminRole}, "warnBuffer": "${config.warnBuffer}", "maxBuffer": "${config.maxBuffer}", "interval": "${config.interval}", "warningMessage": "${config.warningMessage}", "banMessage": "${config.banMessage}", "maxDuplicatesWarning": "${config.maxDuplicatesWarning}", "maxDuplicatesBan": "${config.maxDuplicatesBan}", "deleteMessagesAfterBanForPastDays": "${value}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Delete Messages After Ban for Past Days to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
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
    
      await member.kick(reason)
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
    
    await member.ban(reason)
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
                mutedRole = await message.guild.createRole({
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
    else {
        const vowels = ["a", "e", "i", "o", "u", "y"];
        if (vowels.some(word => message.content.includes(word)) ) {
            const text = message.content;
            (async () => {
                const result = await perspective.analyze(text, {attributes: ['toxicity', 'severe_toxicity', 'identity_attack', 'insult', 'profanity', 'sexually_explicit', 'threat', 'flirtation', 'attack_on_author', 'attack_on_commenter']});
                const v1 = `${result.attributeScores.TOXICITY.summaryScore.value}`;
                const v2 = `${result.attributeScores.SEVERE_TOXICITY.summaryScore.value}`;
                const v3 = `${result.attributeScores.IDENTITY_ATTACK.summaryScore.value}`;
                const v4 = `${result.attributeScores.INSULT.summaryScore.value}`;
                const v5 = `${result.attributeScores.PROFANITY.summaryScore.value}`;
                const v6 = `${result.attributeScores.SEXUALLY_EXPLICIT.summaryScore.value}`;
                const v7 = `${result.attributeScores.THREAT.summaryScore.value}`;
                const v8 = `${result.attributeScores.FLIRTATION.summaryScore.value}`;
                const v9 = `${result.attributeScores.ATTACK_ON_AUTHOR.summaryScore.value}`;
                const v10 = `${result.attributeScores.ATTACK_ON_COMMENTER.summaryScore.value}`;

                if (v1 > 0.5 || v2 > 0.5 || v3 > 0.5 || v4 > 0.5 || v6 > 0.5 || v7 > 0.5 || v8 > 0.5 || v9 > 0.5 || v10 > 0.5) {
                    sb.clear();
                    if (v1 > 0.5) sb.append('**Toxicity**  ');
                    if (v2 > 0.5) sb.append('**Severe Toxicity**  ');
                    if (v3 > 0.5) sb.append('**Identity Attack**  ');
                    if (v4 > 0.5) sb.append('**Insult**  ');
                    if (v5 > 0.5) sb.append('**Profanity**  ');
                    if (v6 > 0.5) sb.append('**Sexually Explicit**  ');
                    if (v7 > 0.5) sb.append('**Threat**  ');
                    if (v8 > 0.5) sb.append('**Flirtation**  ');
                    if (v9 > 0.5) sb.append('**Attack on Author**  ');
                    if (v10 > 0.5) sb.append('**Attack on Commenter**  ');

                    message.delete();
                    message.reply(`your message was deleted for the following reasons: ${sb.toString()}`);
                }

            })();
        }
        else {
            //no u
        }
    }
});

client.login(process.env.DISCORD);

// Invite Link: https://discordapp.com/oauth2/authorize?client_id=502129538797404160&scope=bot&permissions=8