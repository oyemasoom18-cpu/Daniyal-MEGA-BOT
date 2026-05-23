const EventEmitter = require("events");

class Broadcast extends EventEmitter {
  constructor() {
    super();
    this.channels = new Map();
  }

  createChannel(name) {
    if (!this.channels.has(name)) {
      this.channels.set(name, new EventEmitter());
    }
    return this.channels.get(name);
  }

  sendToChannel(channelName, event, data) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.emit(event, data);
      return true;
    }
    return false;
  }

  onChannel(channelName, event, callback) {
    const channel = this.createChannel(channelName);
    channel.on(event, callback);
  }

  removeChannel(name) {
    if (this.channels.has(name)) {
      this.channels.get(name).removeAllListeners();
      this.channels.delete(name);
      return true;
    }
    return false;
  }

  listChannels() {
    return Array.from(this.channels.keys());
  }
}

module.exports = new Broadcast();
module.exports.credits = "SARDAR RDX";
