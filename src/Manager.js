const { EventEmitter } = require('events');
const mergeOptions = require('merge-options');
const Database = require('easy-json-database')

const { ReactionRoleManager } = require('./Util');
const ReactionRole = require('./ReactionRole')

class ReactionRolesManager extends EventEmitter {
  constructor(client, options){
    super();

    this.client = client;

    this.options = mergeOptions(ReactionRoleManager, options)

    this.database = new Database(this.options.storage)

    this.reactionRole = []

    this.client.on("raw", async (packet) => {
      if (!["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(packet.t)) return;
      if(this.reactionRole.some((g) => g.messageID === packet.d.message_id)){
        const reactionRoleData = this.reactionRole.find((g) => g.messageID === packet.d.message_id);
        const reaction_role = new ReactionRole(this, reactionRoleData);
        const guild = this.client.guilds.cache.get(packet.d.guild_id)
        if(!guild) return;
        const role = guild.roles.cache.get(reaction_role.roleID);
        if(!role) return;
        const member = guild.members.cache.get(packet.d.user_id) || guild.members.fetch(packet.d.user_id)
        if(!member);
        const channel = guild.channels.cache.get(packet.d.channel_id) 
        if(!channel) return;
        const message = channel.messages.cache.get(packet.d.message_id) || await channel.message.fetch(packet.d.message_id)
        if(!message) return;
        if (packet.d.emoji.name !== reaction_role.reaction) return;
        const reaction = message.reactions.cache.get(reaction_role.reaction)
        if(!reaction) return;
        if (packet.t === "MESSAGE_REACTION_ADD") {
          member.roles.add(role)
        } else {
          member.roles.remove(role)
        }
      }
    });

    this._init()
  }


  start(options = {}){
    return new Promise(async (resolve, reject) => {
      if (!this.ready) {
        return reject('The manager is not ready yet.');
      }
      if(!options.channel){
        return reject(`channel is not a valid guildchannel. (val=${options.channel})`);
      }
      if(!options.reaction){
        return reject(`options.reaction is not a string. (val=${options.reaction})`);
      }
      if(!options.messageID){
        return reject(`options.messageID is not a string. (val=${options.messageID})`);
      }
      if (!options.role) {
        return reject(`options.role is not a valid guildrole. (val=${options.role})`);
      }
      if(this.reactionRole.some(g => g.messageID === options.messageID && g.reaction === options.reaction)){
        return reject(`you can't set 2 reaction roles with 1 emoji`)
      }
      let reactionrole = new ReactionRole(this,{
        messageID: options.messageID,
        channelID: options.channel.id,
        guildID: options.channel.guild.id,
        roleID: options.role.id,
        reaction: options.reaction
      })
      this.client.channels.cache.get(options.channel.id).messages.fetch(options.messageID).then((msg) => {
        msg.react(options.reaction)
      })
      this.reactionRole.push(reactionrole.data);
      this.database.set(options.channel.guild.id,this.reactionRole)
      console.log(this.database)
      resolve(reactionrole);
    })
  }


  async getAllReactionRoles() {
    const { readFile } = require('fs');
    const { promisify } = require('util');
    const readFileAsync = promisify(readFile);
    const storageContent = await readFileAsync(this.options.storage)
    let rr = JSON.parse(storageContent)
    console.log(rr);
    if (Array.isArray(rr)) {
      return rr;
  }
}
    async _init() {
      this.reactionRole = await this.getAllReactionRoles()
      this.ready = true;
    }
}
module.exports = ReactionRolesManager;