# Discord Reaction Role

Discord Reaction Role is a powerful Node.js module that allows you to easily create reactions roles !

## Installation

```
npm i discord-reaction-role
```

## Exemple

### Lunch of the module

```js
const Discord = require("discord.js"),
client = new Discord.Client(),
settings = {
    prefix: "g!",
    token: "Your Discord Token"
};

// Requires Manager from discord-reaction-role
const ReactionRoleManager = require("discord-reaction-role");
// Starts updating currents reaction roles
const manager = new ReactionRoleManager(client, {
    storage: "./reaction-role.json"
});
// We now have a reactionRoleManager property to access the manager everywhere!
client.reactionRoleManager = manager;

client.on("ready", () => {
    console.log("I'm ready !");
});

client.login(settings.token);
```

* **client**: the discord client (your discord bot instance)
* **options.storage**: the json file that will be used to store reaction roles

### Start

```js
client.reactionRoleManager.start({
      messageID: '706857963188387903',
      channel: message.channel,
      reaction: '✅',
      role: message.guild.roles.cache.get('675995543062839306')
})
```

### Fetch the reaction role

```js
    // The list of all the reaction roles
    let allReactionRoles = client.reactionRoleManager.reactionRole; // [ {ReactionRole}, {ReactionRole} ]

    // The list of all the giveaways on the server with ID "1909282092"
    let onServer = client.reactionRoleManager.reactionRole.filter((g) => g.guildID === "1909282092");
```

