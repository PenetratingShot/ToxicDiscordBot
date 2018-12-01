// - Add role command
// - Add kick user from voice channel command
// Add mute command (working on it)
// Allow Admins to remove certain permissions for a specific user
// - Retry anti-spam
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
        warningMessage: "stop spamming or I'll whack your head off.", // Warning message send to the user indicating they are going to fast.
        banMessage: "has been banned for spamming, anyone else?", // Ban message, always tags the banned user in front of it.
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
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${value}", "modRole": "${config.modRole}", "adminRole": "${config.adminRole}" }`, function (err) {
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
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${value}", "adminRole": "${config.adminRole}" }`, function (err) {
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
            fs.writeFile(`./json/${message.guild.id}1.json`, `{ "prefix": "${config.prefix}", "modRole": "${config.modRole}", "adminRole": "${value}" }`, function (err) {
                if (err) throw err;
                message.reply(`successfully changed Administrator Role to: ${value}`);
                shell.cd('json');
                shell.rm(`${message.guild.id}.json`);
                shell.mv(`${message.guild.id}1.json`, `${message.guild.id}.json`);
            });
        }
    }
    /*else if (command === "setconf") {
        // Command is admin only, let's grab the admin value:
        const adminRole = message.guild.roles.find("name", guildConf.adminRole);
        if(!adminRole) return message.reply("Administrator Role Not Found");

        if(!message.member.roles.has(adminRole.id)) {
            return message.reply(`, you don't have the necessary role ${adminrole} for this command.`);
        }

        const [prop, ...value] = args;

        if(!client.settings.has(message.guild.id, prop)) {
            return message.reply("This key is not in the configuration.");
        }

        client.settings.set(message.guild.id, value.join(" "), prop);

        message.channel.send(`Guild configuration item ${prop} has been changed to:\n\`${value.join(" ")}\``);
    }
    else if(command === "showconf") {
        let configProps = Object.keys(guildConf).map(prop => {
            return `${prop}  :  ${guildConf[prop]}\n`;
        });
        message.channel.send(`The following are the server's current configuration:
    \`\`\`${configProps}\`\`\``);
    }
    else if (command === "purge") {
        if(!message.member.roles.has(adminRole.id)) {
            return message.reply(`, you don't have the necessary role ${adminrole} for this command.`);
        }
        const user = message.mentions.users.first();
        const amount = !!parseInt(message.content.split(' ')[1]) ? parseInt(message.content.split(' ')[1]) : parseInt(message.content.split(' ')[2]);
        if (!amount) return message.reply('Must specify an amount to delete!');
        if (!amount && !user) return message.reply('Must specify a user and amount, or just an amount, of messages to purge!');
         message.channel.fetchMessages({
             limit: amount,
         }).then((messages) => {
             if (user) {
                const filterBy = user ? user.id : client.user.id;
                messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
             }
         message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
}    );
    }*/
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
    /*(else if (command === "viewperms") {
        let user = message.mentions.members.first();
        let lol = message.guild.member(args[0].replace(/[<@!>]/g,"")).user;


        if (!lol) return message.reply(`Fatal: You must mention a valid member on this server. Please try again.`);

        const v1 = user.hasPermission('CREATE_INSTANT_INVITE');
        const v2 = user.hasPermission('KICK_MEMBERS');
        const v3 = user.hasPermission('BAN_MEMBERS');
        const v4 = user.hasPermission('ADMINISTRATOR');
        const v5 = user.hasPermission('MANAGE_CHANNELS');
        const v6 = user.hasPermission('MANAGE_GUILD');
        const v7 = user.hasPermission('ADD_REACTIONS');
        const v8 = user.hasPermission('READ_MESSAGES');
        const v9 = user.hasPermission('SEND_MESSAGES');
        const v10 = user.hasPermission('SEND_TTS_MESSAGES');
        const v11 = user.hasPermission('MANAGE_MESSAGES');
        const v12 = user.hasPermission('EMBED_LINKS');
        const v13 = user.hasPermission('ATTACH_FILES');
        const v14 = user.hasPermission('READ_MESSAGE_HISTORY');
        const v15 = user.hasPermission('MENTION_EVERYONE');
        const v16 = user.hasPermission('EXTERNAL_EMOJIS');
        const v17 = user.hasPermission('CONNECT');
        const v18 = user.hasPermission('SPEAK');
        const v19 = user.hasPermission('MUTE_MEMBERS');
        const v20 = user.hasPermission('DEAFEN_MEMBERS');
        const v21 = user.hasPermission('MOVE_MEMBERS');
        const v22 = user.hasPermission('USE_VAD');
        const v23 = user.hasPermission('CHANGE_NICKNAME');
        const v24 = user.hasPermission('MANAGE_NICKNAMES');
        const v25 = user.hasPermission('MANAGE_ROLES_OR_PERMISSIONS');
        const v26 = user.hasPermission('MANAGE_WEBHOOKS');
        const v27 = user.hasPermission('MANAGE_EMOJIES');

        const embed = new Discord.RichEmbed()
            .setTitle(`Viewing Permissions for ${lol.username}`)
            .setColor(0x00AE86)
            .setTimestamp()
            .setDescription(`\n**Create Invites:** ${v1}\n**Kick Members:** ${v2}\n**Ban Members:** ${v3}\n**Administrator:** ${v4}\n**Manage Channels:** ${v5}\n**Manage Guild:** ${v6}\n**Add Reactions:** ${v7}\n**Read Messages:** ${v8}\n**Send Messages:** ${v9}\n**Send TTS Messages:** ${v10}\n**Manage Messages:** ${v11}\n**Embed Links:** ${v12}\n**Attach Files:** ${v13}\n**Read Message History:** ${v14}\n**Mention Everyone:** ${v15}\n**External Emojies:** ${v16}\n**Connect to Voice:** ${v17}\n**Speak in Voice:** ${v18}\n**Mute People:** ${v19}\n**Deafen People:** ${v20}\n**Move People:** ${v21}\n**VAD:** ${v22}\n**Change Nickname:** ${v23}\n**Manage Nicknames:** ${v24}\n**Manage Roles/Permissions:** ${v25}\n**Manage Webhooks:** ${v26}\n**Manage Emojies:** ${v27}`)
            .setThumbnail(lol.avatarURL);

        message.channel.send({embed});

    }*/
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
            message.reply("Looks like you found a loophole :/");
        }
    }
});

client.login(process.env.DISCORD);

// Invite Link: https://discordapp.com/oauth2/authorize?client_id=502129538797404160&scope=bot&permissions=8