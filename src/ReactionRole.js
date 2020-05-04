const { EventEmitter } = require('events');

class ReactionRole extends EventEmitter {
  constructor(manager, options) {
    super();

    this.client = manager.client;

    this.manager = manager;

    this.messageID = options.messageID;

    this.channelID = options.channelID;

    this.guildID = options.guildID;

    this.reaction = options.reaction;

    this.roleID = options.roleID;

    this.options = options;
  }

  get channel(){
    this.client.guilds.cache.get(this.guildID).channels.cache.get(this.channelID)
  }

  get role(){
    this.client.guilds.cache.get(this.guildID).roles.cache.get(this.roleID)
  }

  get fetchMessage(){
    this.channel.messages.fetch(this.messageID)
  }
  get data(){
    const baseData = {
      messageID: this.messageID,
      channelID: this.channelID,
      guildID: this.guildID,
      reaction: this.reaction,
      roleID: this.roleID
    };
    if(this.options.messageID) baseData.messageID = this.options.messageID;
    if (this.options.channelID) baseData.channelID = this.options.channelID;
    if (this.options.guildID) baseData.guildID = this.options.guildID;
    if (this.options.reaction) baseData.reaction = this.options.reaction;
    if (this.options.roleID) baseData.roleID = this.options.roleID;
    return baseData;
  }
}
module.exports = ReactionRole;