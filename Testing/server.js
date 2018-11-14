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
const original = require('./json/default.json');
const prefix = "!";

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
      if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
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
    if(!member)
      return message.reply("Fatal: You must mention a valid member on this server. Please try again.");
    if(!member.bannable) 
      return message.reply("Unable to ban user. Make sure that I have the necessary perms and that my role is above theirs in the role hierarchy.");
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided by Admins.";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of: ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
    }
    else if (command === "mute") {
        if (!message.member.roles.some(r=>["Admin"].includes(r.name)) )
            return message.reply(`${message.author} you don't have the necessary role {Admin} for this command.`);

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

            if (v1 > 0.4 || v2 > 0.4 || v3 > 0.4 || v4 > 0.4 || v5 > 0.4 || v6 > 0.4 || v7 > 0.4 || v8 > 0.4 || v9 > 0.4 || v10 > 0.4) {
                message.delete();
                message.reply('Be careful! Your message was deleted for the following reasons:');
                // Here we go again... :(
                    if (v1 > 0.4) message.channel.send('Toxicity');
                    if (v2 > 0.4) message.channel.send('Severe Toxicity');
                    if (v3 > 0.4) message.channel.send('Identity Attack');
                    if (v4 > 0.4) message.channel.send('Insult');
                    if (v5 > 0.4) message.channel.send('Profanity');
                    if (v6 > 0.4) message.channel.send('Sexually Explicit');
                    if (v7 > 0.4) message.channel.send('Threat');
                    if (v8 > 0.4) message.channel.send('Flirtation');
                    if (v9 > 0.4) message.channel.send('Attack on Author');
                    if (v10 > 0.4) message.channel.send('Attack on Commenter');
            }
            else {/*Don't need anything here*/}
        })();
    }
    }
});

client.login(process.env.DISCORD);

// Invite Link: https://discordapp.com/oauth2/authorize?client_id=502129538797404160&scope=bot&permissions=8