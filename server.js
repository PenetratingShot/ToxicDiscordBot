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

    const vowels = ["a", "e", "i", "o", "u", "y"];
    if ( vowels.some(word => message.content.includes(word)) ) {
        const text = `${message.content}`;
        
        const result = await perspective.analyze(text);
        
        //Just for testing purposes
        //console.log(result);

        app.get("/oof/", (request, response) => {
           response.setHeader('content-type', 'application/json')
          //let disc = request.params.disc
          //response.send(text)
          response.send(result)
        })
        
        //DialogflowAI POST for adaptive help section
        app.get("/help", (request, response) => {
          response.setHeader('content-type', 'application/json')  
          response.send("Coming Soon")
        })
      
        const listener = app.listen(process.env.PORT, () => {
            console.log(`Your app is listening on port ${listener.address().port}`)
        })
        
        request('https://https://impartial-force.glitch.me/oof', function (error, res, body) {
          console.log('Error:', error);
          console.log(res.body.attributeScores.TOXICITY.spanScores.score.value[0]);
        });
    }
});

client.login(process.env.DISCORD);