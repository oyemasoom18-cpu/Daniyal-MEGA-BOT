module.exports = {
  API_VERSION: "v17.0",
  MESSENGER_DOMAIN: "https://www.messenger.com",
  FACEBOOK_DOMAIN: "https://www.facebook.com",
  GRAPHQL_URL: "https://www.facebook.com/api/graphql/",
  MQTTT_WSS: "wss://mqtt.facebook.com",
  
  DEFAULT_OPTIONS: {
    selfListen: false,
    listenEvents: true,
    listenTyping: true,
    updatePresence: true,
    forceLogin: false,
    autoMarkRead: false,
    autoReconnect: true,
    online: true,
    emitReady: false
  },
  
  THREAD_COLORS: [
    { id: "196241301066133", color: "#44bec7", name: "Blue" },
    { id: "198891435620597", color: "#ffc300", name: "Yellow" },
    { id: "205488387850067", color: "#fa383e", name: "Red" },
    { id: "172261731342976", color: "#764ba2", name: "Purple" },
    { id: "192186258197773", color: "#667eea", name: "Indigo" },
    { id: "158399850242976", color: "#43a047", name: "Green" },
    { id: "104166122426412", color: "#ff6f00", name: "Orange" },
    { id: "205488387850068", color: "#90a4ae", name: "Gray" }
  ],
  
  REACTIONS: {
    like: "👍",
    love: "❤️",
    haha: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😠",
    care: "😍"
  },
  
  MESSAGE_TYPES: {
    message: "message",
    photo: "photo",
    video: "video",
    audio: "audio",
    file: "file",
    sticker: "sticker",
    location: "location"
  },
  
  ERROR_CODES: {
    E001: "Login failed",
    E002: "Invalid credentials",
    E003: "Session expired",
    E004: "Network error",
    E005: "Rate limited",
    E006: "Server error",
    E007: "Invalid thread",
    E008: "Permission denied"
  }
};
module.exports.credits = "SARDAR RDX";
