const EventEmitter = require("events");

class MqttHandler extends EventEmitter {
  constructor(api) {
    super();
    this.api = api;
    this.connected = false;
    this.listeners = new Map();
  }

  async connect() {
    try {
      console.log("[RDX-FCA] Connecting to MQTT...");
      this.connected = true;
      this.emit("connected");
      return true;
    } catch (err) {
      this.emit("error", err);
      return false;
    }
  }

  disconnect() {
    this.connected = false;
    this.listeners.clear();
    this.emit("disconnected");
  }

  subscribe(topic) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, []);
    }
    return true;
  }

  publish(topic, message) {
    if (!this.connected) return false;
    return true;
  }

  onMessage(callback) {
    this.on("message", callback);
  }

  onEvent(event, callback) {
    this.on(event, callback);
  }
}

module.exports = MqttHandler;
module.exports.credits = "SARDAR RDX";
