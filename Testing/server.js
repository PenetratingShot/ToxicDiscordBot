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
const express = require('express');
const app = express();
const delay = require('delay');
const antispam = require('discord-anti-spam');
const googleapis = require('googleapis');
const API_KEY = `${process.env.PERSPECTIVE1}`;
const DISCOVERY_URL = 'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1';
const fs = require('fs');
const Enmap = require('enmap');
const StringBuilder = require('string-builder');
let sb = new StringBuilder();
const defaultSettings = require('./json/default.json');
const shell = require('shelljs');

client.settings = new Enmap();

/*const defaultSettings = {
    modLogChannel: "mod-log",
    modRole: "Mod",
    adminRole: 'Admin',
    welcomeChannel: 'welcome',
    welcomeMessage: 'Say hello to {{user}} everyone!',
    warnBuffer: 8, // Amount of messages sent to warrant a warning
    maxBuffer: 10, // Amount of messages sent to warrant a ban
    interval: 1000, //1 second interval between buffers
    warningMessage: 'please stop spamming messages. You need to chill.', // Message for when someone has been warned
    banMessage: 'has been banned for spamming messages. Better not do it again.', // Message for when bot bans someone
    maxDuplicatesWarning: 7, // Maximum number of duplicate messages in specified interval for warning
    maxDuplicatesBan: 10, // Maximum number of duplicate messages in a specified interval for ban
    deleteMessagesAfterBanForPastDays: 7, // When someone gets banned, 7 days of message history will be deleted
    exemptRoles: [],
    exemptUsers: []
}()*/

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
    const guildConf = client.settings.ensure(message.guild.id, defaultSettings);
    const adminRole = message.guild.roles.find("name", guildConf.adminRole);
    const prefix = guildConf.prefix;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (message.author.bot) return;
    
    if (command === 'help') {
      const embed = new Discord.RichEmbed()
        .setTitle("Toxicity Help Section")
        .setColor(936362)
        .setDescription(`**Setup:**\nYou need to do some things before this bot can be fully operational.\n- you need to create a dummy role called 'Admin' and assign it to administrators\n- make sure that the bot has administrator permissions (don't uncheck the box)\n- make sure that the bot has a role higher than those of the people it has to moderate (otherwise it won't work)\n\n**Commands**\n!help: sends the help section to the person who requested it\n!purge [number]: purges a specified number of messages from the chat\n!kick [mention]: kicks a mentioned user from the server\n!ban [mention]: bans a mentioned user from the server`)

      message.author.send(embed);
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
        if(!message.member.roles.has(adminRole.id)) {
            return message.reply(`, you don't have the necessary role ${adminrole} for this command.`);
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
        if(!message.member.roles.has(adminRole.id)) {
            return message.reply(`, you don't have the necessary role ${adminrole} for this command.`);
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
        if(!message.member.roles.has(adminRole.id)) {
            return message.reply(`, you don't have the necessary role ${adminrole} for this command.`);
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