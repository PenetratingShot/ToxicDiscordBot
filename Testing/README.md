# ToxicTest Bot

This is the folder for the testing version of the bot. All the normal code can be found in the root folder of this repository. The testing bot is separate from the main one and doesn't share the same codebase. Feel free to invite the bot to your own server, just remember that it won't be online most of the time. In addition, when it is online, nothing will work correctly since it's currently being tuned for the official testing server.

Also note that the normal bot doesn't work well either. The main feature functions I guess, it just doesn't work well and the commands aren't good. Still, you may choose to host it yourself. The instructions will be in the root directory README.md

## Usage

#### User Commands

| Commands    | Arguments | Possible Arguments | Role Needed  |
|-------------|-----------|--------------------|--------------|
| !help       | No        |                    |              |
| !kick       | Yes       | [mention]          | Mod or Admin |
| !ban        | Yes       | [mention]          | Admin        |
| !purge      | Yes       | [mention]          | Admin        |
| !mute       | Yes       | [mention] [time]   | Admin        |
| !showconfig | No        |                    |              |
| !setconfig  | Yes       | [setting] [value]  | Admin        |
| !reset      | No        |                    | Admin        |

#### Server Settings

| Settings   | Type    | Description                                                                        | Default Setting |
|------------|---------|------------------------------------------------------------------------------------|-----------------|
| prefix     | string  | The universal prefix for the server                                                | !               |
| modRole    | string  | The Moderator role. Needed for the kick command.                                   | Mod             |
| adminRole  | string  | The Administrator role. Needed for most of the settings.                           | Admin           |
| on         | boolean | Can turn the filter on and off. true = on; false = off;                            | true            |
| logChannel | string  | The channel to which the bot logs infractions. No need to put a # before the name. | mod-log         |

*Please note that the names for the settings are case-sensitive. The bot won't work if you spell it incorrectly.*

## Compiling from Source
#### Prerequisites
1. Get a token for the Perspective API [here](https://www.perspectiveapi.com/#/)
    
    • The PerspectiveAPI is a necessary part of the bot (it's literally the main feature)
    
    • The bot literally won't build without it

2.  Get a Discord Bot token [here](https://discordapp.com/developers/applications/)

    • Can't build a bot without the actual token...
3. Verify that you have *node* and *npm* installed
    
    • `node -v` and `npm -v`
#### Cloning

```bash
$ git clone https://github.com/PenetratingShot/ToxicDiscordBot
```

#### Building
1. Get into the folder
    
    • `$ cd ToxicDisordBot/Testing`
2.  Export your environment variables

    • `$ export DISORD=YOUR.DISCORD.BOT.TOKEN`
    
    • `$ export PERSPECTIVE1=YOUR.PERSPECTIVEAPI.TOKEN`
3. Install the dependencies

    • `$ [sudo] npm install`
4. Run the bot
    
    • `$ node server`
