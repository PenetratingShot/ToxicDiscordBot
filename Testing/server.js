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
const Jimp = require('jimp');
const googleapis = require('googleapis');
const API_KEY = `${process.env.PERSPECTIVE1}`;
const DISCOVERY_URL = 'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1';
const fs = require('fs');

// Functions for appending files 'yes'

function attackOnAuthor() {
    fs.appendFile('./json/all.txt', 'Attack on Author  ', function (err) {
        if (err) throw err;
    })
}
function attackOnCommenter() {
    fs.appendFile('./json/all.txt', 'Attack on Commenter  ', function (err) {
        if (err) throw err;
    })
}
function flirtation() {
    fs.appendFile('./json/all.txt', 'Flirting  ', function (err, file) {
        if (err) throw err;
    })
}
function identityAttack() {
    fs.appendFile('./json/all.txt', 'Identity Attack  ', function (err, file) {
        if (err) throw err;
    })
}
function insult() {
    fs.appendFile('./json/all.txt', 'Insult  ', function (err, file) {
        if (err) throw err;
    })
}
function profanity() {
    fs.appendFile('./json/all.txt', 'Profanity  ', function (err, file) {
        if (err) throw err;
    })
}
function severeToxicity() {
    fs.appendFile('./json/all.txt', 'Severe Toxicity  ', function (err, file) {
        if (err) throw err;
    })
}
function sexuallyExplicit() {
    fs.appendFile('./json/all.txt', 'Sexually Explicit  ', function (err, file) {
        if (err) throw err;
    })
}
function threat() {
    fs.appendFile('./json/all.txt', 'Threat  ', function (err, file) {
        if (err) throw err;
    })
}
function toxicity() {
    fs.appendFile('./json/all.txt', 'Toxic  ', function (err, file) {
        if (err) throw err;
    })
}

const http = require('http');
app.get("/", (request, response) => {
  console.log(Date.now() + " Dood it just got pinged.");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

// WHen bot joins a guild
client.on("guildCreate", guild => {
    console.log(`Joined a new guild: ` + guild.name);
});

// Don't need guildDelete here

client.on('ready', () => {
    console.log('It works I guess..');
    client.user.setActivity(`!help for help`);
    client.user.setStatus('dnd');
});

client.on('message', async message => {
    const prefix = "!";

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (message.author.bot) return;
    
    if (message.content === '!help') {
      const embed = new Discord.RichEmbed()
        .setTitle("Toxicity Help Section")
        .setColor(936362)
        .setDescription(`**Setup:**\nYou need to do some things before this bot can be fully operational.\n- you need to create a dummy role called 'Admin' and assign it to administrators\n- make sure that the bot has administrator permissions (don't uncheck the box)\n- make sure that the bot has a role higher than those of the people it has to moderate (otherwise it won't work)\n\n**Commands**\n!help: sends the help section to the person who requested it\n!purge [number]: purges a specified number of messages from the chat\n!kick [mention]: kicks a mentioned user from the server\n!ban [mention]: bans a mentioned user from the server`)

      message.author.send(embed);
    }
    else if (command === "purge") {
      if(message.member.roles.some(r=>["Admin"].includes(r.name)) ) {
        
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
      } else {
        message.channel.send(`${message.author} you don't have the necessary role {Admin} for this command.`);
      }
    }
    else if (command === "kick") {
      if(!message.member.roles.some(r=>["Admin"].includes(r.name)) )
      return message.reply("${message.author} you don't have the necessary role {Admin} for this command.");

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
      if (!message.member.roles.some(r=>["Admin"].includes(r.name)) )
      return message.reply(`${message.author} you don't have the necessary role {Admin} for this command.`);
    
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
        if (!message.member.roles.some(r=>["Admin"].includes(r.name)) )
            return message.reply(`${message.author} you don't have the necessary role {Admin} for this command.`);
        let member = message.mentions.members.first();

        if (!member) return message.reply("Fatal: You must mention a valid member on this server. Please try again.");
        if (!member.hasPermission('SEND_MESSAGES')) return message.reply(`Fatal: ${member} already isn't able to speak in chat.`)
        if (member.hasPermission('SEND_MESSAGES')) {
            message.channel.overwritePermissions(member, {
                SEND_MESSAGES: false
            })
                .then(updated => message.reply(`Successfully muted ${member} indefinitely`))
                .catch(console.error);
        }
    }
    else if (command === "unmute") {
        if (!message.member.roles.some(r=>["Admin"].includes(r.name)) )
            return message.reply(`${message.author} you don't have the necessary role {Admin} for this command.`);
        let member = message.mentions.members.first();

        if (!member) return message.reply("Fatal: You must mention a valid member on this server. Please try again.");
        if (member.hasPermission('SEND_MESSAGES')) return message.reply(`Fatal: ${member} already has permission to send messages`);
        if (!member.hasPermission('SEND_MESSAGES')) {
         message.channel.overwritePermissions(member, {
             SEND_MESSAGES: true
         })
             .then(updated => message.reply(`Successfully unmuted ${member} indefinitely. `))
             .catch(console.error);
        }
    }
    else if (command === "viewperms") {
        let user = message.mentions.members.first();
        let lol = message.guild.member(args[0].replace(/[<@!>]/g,"")).user;
        /*const possiblePermissions = ["CREATE_INSTANT_INVITE", "KICK_MEMBERS", "BAN_MEMBERS", "ADMINISTRATOR", "MANAGE_CHANNELS", "MANAGE_GUILD", "ADD_REACTIONS", "READ_MESSAGES", "SEND_MESSAGES", "SEND_TTS_MESSAGE", "MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "EXTERNAL_EMOJIS", "CONNECT", "SPEAK", "MUTE_MEMBERS", "DEAFEN_MEMBERS", "MOVE_MEMBERS", "USE_VAD", "CHANGE_NICKNAME", "MANAGE_NICKNAMES", "MANAGE_ROLES_OR_PERMISSIONS", "MANAGE_WEBHOOKS", "MANAGE_EMOJIS"];
        if (possiblePermissions.some(word => message.content.includes(word)) ) {

        }*/

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

    }
    else if (command === "setperms") {
        if (!message.member.roles.some(r=>["Admin"].includes(r.name)) )
            return message.reply(`${message.author} you don't have the necessary role {Admin} for this command.`);
        let mention = message.mentions.users.first();
        let lol = message.guild.member(args[0].replace(/[<@!>]/g,"")).user;

        if (!mention) return message.reply('Fatal: You must mention a valid member of this server.');

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

        // Check for changing instant invite permissions
        const instantInvite = ["CREATE_INSTANT_INVITE"];
        if (instantInvite.some(word => message.content.includes(word)) ) {
            if (user.hasPermission('CREATE_INSTANT_INVITE')) {
                message.channel.overwritePermissions(user, {
                    'CREATE_INSTANT_INVITE': false
                })
                    .then(updated => message.reply(`, ${lol} can no longer create instant invites.`))
                    .catch(console.error);
            }
            else {
                message.channel.overwritePermissions(user, {
                    'CREATE_INSTANT_INVITE': true
                })
                    .then(updated => message.reply(`, ${lol} now has the ability to create instant invites.`))
                    .catch(console.error);
            }


        }

    }
    else {
      const vowels = ["a", "e", "i", "o", "u", "y"];
      if ( vowels.some(word => message.content.includes(word)) ) {
        const text = `${message.content}`;
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
            
            // Clear the file to make sure that the data won't screw up

            fs.writeFile('./json/all.txt', ' ', function (err, file) {
                if (err) throw err;
            })

            //Statements to trigger functions that append files
            if (v1 > 0.4) toxicity();
            if (v2 > 0.4) severeToxicity();
            if (v3 > 0.4) identityAttack();
            if (v4 > 0.4) insult();
            if (v5 > 0.4) profanity();
            if (v6 > 0.4) sexuallyExplicit();
            if (v7 > 0.4) threat();
            if (v8 > 0.4) flirtation();
            if (v9 > 0.4) attackOnAuthor();
            if (v10 > 0.4) attackOnCommenter();

            // Now we have the completed file with all the reasons

            fs.readFile('./json/all.txt', function (err, data) {
                if (data == ' ') {
                    return;
                }
                else {
                    message.channel.send(`${message.author}, your message was deleted for the following reasons: ${data}`);
                }
            })

        })();
    }
    }
});

client.login(process.env.DISCORD);

// Invite Link: https://discordapp.com/oauth2/authorize?client_id=502129538797404160&scope=bot&permissions=8