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
    if (message.author.bot) return;
    
    if (message.content === 'help') {
      
    }
    else {
      const vowels = ["a", "e", "i", "o", "u", "y"];
    if ( vowels.some(word => message.content.includes(word)) ) {
        const text = `${message.content}`;
        
        const result = await perspective.analyze(text);
        
        //Just for testing purposes
        //console.log(result);

        app.get("/resp", (request, response) => {
           response.setHeader('content-type', 'application/json')
          //let disc = request.params.disc
          //response.send(text)
          response.send(result)
        })
      
        got('https://toxicity-monitor.glitch.me/resp', { json: true }).then(response => {
          console.log(response.body)
        })
        .catch(error => {
          console.log(error)
        });
          
        
        const listener = app.listen(1800, () => {
            console.log(`Your app is listening on port ${listener.address().port}`);
        })
    }
    }
});

client.login(process.env.DISCORD);