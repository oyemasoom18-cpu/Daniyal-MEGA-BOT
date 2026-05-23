const EventEmitter = require("events");

module.exports = function(api) {
  const emitter = new EventEmitter();

  const listenMqtt = function(callback) {
    if (typeof callback === "function") {
      emitter.on("message", callback);
    }

    const startMqtt = async () => {
      try {
        const mqttConfig = await getMqttConfig(api);
        if (mqttConfig && mqttConfig.url) {
          console.log("[RDX-FCA] MQTT listening started");
          emitter.emit("ready", { rdx: true, owner: "Sardar RDX" });
        }
      } catch (err) {
        console.error("[RDX-FCA] MQTT error:", err.message);
      }
    };

    if (api._options.listenEvents || api._options.listenTyping) {
      startMqtt();
    }

    return emitter;
  };

  listenMqtt.stop = function() {
    emitter.removeAllListeners();
    console.log("[RDX-FCA] MQTT listening stopped");
  };

  return listenMqtt;
};

async function getMqttConfig(api) {
  return {
    url: "wss://mqtt.facebook.com",
    region: "no",
    sid: Date.now().toString()
  };
}
module.exports.credits = "SARDAR RDX";
