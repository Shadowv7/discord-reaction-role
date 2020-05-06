const { EventEmitter } = require('events');
const mergeOptions = require('merge-options');
const { writeFile, readFile, exists } = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(writeFile);
const existsAsync = promisify(exists);
const readFileAsync = promisify(readFile);

const { ReactionRoleManager } = require('./Util');
const ReactionRole = require('./ReactionRole')

class ReactionRolesManager extends EventEmitter {
  constructor(client, options) {
    super();

    this.client = client;

    this.options = mergeOptions(ReactionRoleManager, options);

    this.reactionRole = [];

    this.client.on("raw", async (packet) => {
      if (
        !["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(packet.t)
      )
        return;
      if (this.reactionRole.some((g) => g.messageID === packet.d.message_id)) {
        const reactionRoleData = this.reactionRole.find(
          (g) => g.messageID === packet.d.message_id && g.reaction === packet.d.emoji.name
        );
        const reaction_role = new ReactionRole(this, reactionRoleData);
        const guild = this.client.guilds.cache.get(packet.d.guild_id);
        if (!guild) return;
        const role = guild.roles.cache.get(reaction_role.roleID);
        if (!role) return;
        const member =
          guild.members.cache.get(packet.d.user_id) ||
          guild.members.fetch(packet.d.user_id);
        if (!member) return;
        const channel = guild.channels.cache.get(packet.d.channel_id);
        if (!channel) return;
        const message =
          channel.messages.cache.get(packet.d.message_id) ||
          (await channel.messages.fetch(packet.d.message_id));
        if (!message) return;
        if (packet.d.emoji.name !== reaction_role.reaction) return;
        const reaction = message.reactions.cache.get(reaction_role.reaction);
        if (!reaction) return;
        if (packet.t === "MESSAGE_REACTION_ADD") {
          member.roles.add(role);
           this.emit(
             "reactionRoleAdded",
             reaction_role,
             member,
             role,
             reaction_role.reaction
           );
        } else {
          member.roles.remove(role);
          this.emit(
            "reactionRoleRemoved",
            reaction_role,
            member,
            role,
            reaction_role.reaction
          );
        }
      }
    });

    this._init();
  }

  create(options = {}) {
    return new Promise(async (resolve, reject) => {
      if (!this.ready) {
        return reject("The manager is not ready yet.");
      }
      if (!options.channel) {
        return reject(
          `channel is not a valid guildchannel. (val=${options.channel})`
        );
      }
      if (!options.reaction) {
        return reject(
          `options.reaction is not a string. (val=${options.reaction})`
        );
      }
      if (!options.messageID) {
        return reject(
          `options.messageID is not a string. (val=${options.messageID})`
        );
      }
      if (!options.role) {
        return reject(
          `options.role is not a valid guildrole. (val=${options.role})`
        );
      }
      if (
        this.reactionRole.some(
          (g) =>
            g.messageID === options.messageID && g.reaction === options.reaction
        )
      ) {
        return reject(`you can't set 2 reaction roles with 1 emoji`);
      }
      let reactionrole = new ReactionRole(this, {
        messageID: options.messageID,
        channelID: options.channel.id,
        guildID: options.channel.guild.id,
        roleID: options.role.id,
        reaction: options.reaction,
      });
      this.client.channels.cache
        .get(options.channel.id)
        .messages.fetch(options.messageID)
        .then((msg) => {
          msg.react(options.reaction);
        });
      this.reactionRole.push(reactionrole.data);
      this.saveReactionRole(options.messageID, this.reactionRole);
      resolve(reactionrole);
    });
  }
  
  delete(options = {}){
  return new Promise(async (resolve, reject) => {
    if (!options.reaction) {
      return reject(
        `options.reaction is not a string. (val=${options.reaction})`
      );
    }
    if (!options.messageID) {
      return reject(
        `options.messageID is not a string. (val=${options.messageID})`
      );
    }
    this.deleteReactionRole(options.messageID,options.reaction)
    resolve()
  })

  }

  async refreshStorage() {
    return true;
  }

  async getAllReactionRoles() {
    let storageExists = await existsAsync(this.options.storage);
    if (!storageExists) {
      await writeFileAsync(this.options.storage, "[]", "utf-8");
      return [];
    } else {
      let storageContent = await readFileAsync(this.options.storage);
      try {
        let giveaways = await JSON.parse(storageContent);
        if (Array.isArray(giveaways)) {
          return giveaways;
        } else {
          console.log(storageContent, giveaways);
          throw new SyntaxError("The storage file is not properly formatted.");
        }
      } catch (e) {
        if (e.message === "Unexpected end of JSON input") {
          throw new SyntaxError(
            "The storage file is not properly formatted.",
            e
          );
        } else {
          throw e;
        }
      }
    }
  }

  async saveReactionRole(_messageID, _reactionRoleData) {
    await writeFileAsync(
      this.options.storage,
      JSON.stringify(this.reactionRole),
      "utf-8"
    );
    this.refreshStorage();
    return;
  }

  async deleteReactionRole(messageID, reaction) {
    try {
      const rr = this.reactionRole.filter(
        (r) => r.messageID === messageID && r.reaction === reaction
      );
      const channel = rr[0].channelID
      console.log(channel)
      this.client.channels.cache.get(channel).messages.fetch(messageID).then((msg) => {
        msg.reactions.cache.get(reaction).remove()
      })
    this.reactionRole = this.reactionRole.filter(
      (rr) => rr.reaction !== reaction || rr.messageID !== messageID
    );
    await writeFileAsync(
      this.options.storage,
      JSON.stringify(this.reactionRole),
      "utf-8"
    );
    this.refreshStorage();
    return;
    } catch (e){
      return console.log(`Error : ${e}`)
    }
  }

  async _init() {
    this.reactionRole = await this.getAllReactionRoles();
    this.ready = true;
  }
}
module.exports = ReactionRolesManager;
