// - Add role command
// - Add kick user from voice channel command
// - Retry anti-spam
// - Add funny "banned" image after ban

const Discord = require("discord.js");
require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 15;
const client = new Discord.Client;
const Perspective = require('perspective-api-client');
const perspective = new Perspective({apiKey: process.env.PERSPECTIVE1})
const googleapis = require('googleapis');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const prefix = "!";
const delay = require('delay');
const antispam = require('discord-anti-spam');
const Jimp = require('jimp');

const http = require('http');
app.get("/", (request, response) => {
  console.log(Date.now() + " Dood it just got pinged.");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

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
        .setDescription(`**Commands**\n!help: sends the help section to the person who requested it\n!purge [number]: purges a specified number of messages from the chat`)

      message.author.send(embed);
    }
    else if (command === "purge") {
      if(message.member.roles.some(r=>["Admin"].includes(r.name)) ) {
        
      const user = message.mentions.users.first();
      const amount = !!parseInt(message.content.split(' ')[1]) ? parseInt(message.content.split(' ')[1]) : parseInt(message.content.split(' ')[2])
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
        message.channel.send(`${message.author} you don't have the neccessary role {Admin} for this command.`);
      }
    }
    else if (command === "testimg") {
      let img = mention.avatar
    }
    else if (command === "kick") {
      if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

      let member = message.mentions.members.first() || message.guild.members.get(args[0]);
      if(!member)
        return message.reply("Fatal: You must mention a valid member on this server. Please try again.");
      if(!member.kickable) 
        return message.reply("Unable to kick user. Make sure that I have the necessary perms and that my role is above theirs in the role hierarchy.");

      let reason = args.slice(1).join(' ');
      if(!reason) reason = "No reason provided by Admins.";
    
      await member.kick(reason)
        .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
        message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
    }
    else if (command === "ban") {
      if(!message.member.roles.some(r=>["Admin"].includes(r.name)) )
      return message.reply(`${message.author} you don't have the neccessary role {Admin} for this command.`);
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Fatal: You must mention a valid member on this server. Please try again.");
    if(!member.bannable) 
      return message.reply("Unable to ban user. Make sure that I have the necessary perms and that my role is above theirs in the role hierarchy.");
    if (member.bannable) {
      // add image here
    }
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided by Admins.";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
    }
    else {
      const vowels = ["a", "e", "i", "o", "u", "y"];
      if ( vowels.some(word => message.content.includes(word)) ) {
        const text = `${message.content}`;
        
        const result = await perspective.analyze(text);
        
        console.log(`${result.attributeScores.TOXICITY.summaryScore.value}`);

        let value = result.attributeScores.TOXICITY.summaryScore.value;

        if (value > 0.4 || value == 0.4) {
          message.reply(`This message can be percieved as toxic. These messages will be deleted in 5 seconds.`);

          (async () => {
            await delay(5000);
            message.delete();
            message.delete();
          })();
        }
        else {
          console.log(`${result.attributeScores.TOXICITY.summaryScore.value}`);
        }
    }
    }
});

client.login(process.env.DISCORD);