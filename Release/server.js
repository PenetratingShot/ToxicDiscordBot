const Discord = require("discord.js");
require('events').EventEmitter.prototype._maxListeners = 9999;
const client = new Discord.Client;
const Perspective = require('perspective-api-client');
const perspective = new Perspective({apiKey: process.env.PERSPECTIVE})
const googleapis = require('googleapis');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const axios = require('axios');
const got = require('got');
const prefix = "pls";
const delay = require('delay');
const randomcolor = require('randomcolor');
const color = randomcolor();

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
    client.user.setActivity(`Type something...`);
    client.user.setStatus('dnd');
});

client.on('message', async message => {
     const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();

  
    if (message.author.bot) return;
    
    if (message.content === 'pls help') {
      message.channel.send({embed: {
        "title": "Help Section",
        "color": color,
        "description": "This is the help sections" 
      }});
    }
    else if (command === "purge") {
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
    }
    else {
      const vowels = ["a", "e", "i", "o", "u", "y"];
      if ( vowels.some(word => message.content.includes(word)) ) {
        const text = `${message.content}`;
        
        const result = await perspective.analyze(text);
        
        //Just for testing purposes
        //console.log(result.attributeScores.TOXICITY.spanScores[2]);

        app.get("/resp", (request, response) => {
           response.setHeader('content-type', 'application/json')
          //let disc = request.params.disc
          //response.send(text)
          response.send(result.attributeScores);
        });
        
        request("https://toxicity-monitor.glitch.me", { json: true }, function (error, res, body) {
          console.log("Successfully made request");
        });
        
        const listener = app.listen(1800, () => {
            console.log(`Your app is listening on port ${listener.address().port}`);
        })
    }
    }
});

client.login(process.env.DISCORD);