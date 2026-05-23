module.exports = function(api) {
  return async function(messageID) {
    return {
      messageID: messageID,
      timestamp: Date.now()
    };
  };
};
module.exports.credits = "SARDAR RDX";
