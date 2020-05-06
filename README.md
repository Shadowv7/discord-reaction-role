# Discord Reaction Role
[![downloadsBadge](https://img.shields.io/npm/dt/discord-reaction-role?style=for-the-badge)](https://npmjs.com/discord-reaction-role)
[![versionBadge](https://img.shields.io/npm/v/discord-reaction-role?style=for-the-badge)](https://npmjs.com/discord-reaction-roles)

Discord Reaction Role is a powerful [Node.js](https://nodejs.org) module that allows you to easily create reactions roles !

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
client.reactionRoleManager.create({
      messageID: '706857963188387903',
      channel: message.channel,
      reaction: '✅',
      role: message.guild.roles.cache.get('675995543062839306')
})
```

### Delete

```js
client.reactionRoleManager.delete({
          messageID: "707532556223905802",
          reaction: "✅",
        });
```

### Fetch the reaction role

```js
    // The list of all the reaction roles
    let allReactionRoles = client.reactionRoleManager.reactionRole; // [ {ReactionRole}, {ReactionRole} ]

    // The list of all the giveaways on the server with ID "1909282092"
    let onServer = client.reactionRoleManager.reactionRole.filter((rr) => rr.guildID === "1909282092");
```
## Events

### reactionRoleAdded

```js
client.reactionRoleManager.on('reactionRoleAdded',(reactionRole,member,role,reaction) => {
  console.log(`${member.user.username} added his reaction \`${reaction}\` and won the role : ${role.name}`);
})
```

### reactionRoleRemoved

```js
client.manager.on("reactionRoleRemoved", (reactionRole, member, role, reaction) => {
  console.log(`${member.user.username} removed his reaction \`${reaction}\` and lost the role : ${role.name}`)
});
```

# Credits

Thanks to [Androz2091](https://github.com/Androz2091) for helping me on this project.
