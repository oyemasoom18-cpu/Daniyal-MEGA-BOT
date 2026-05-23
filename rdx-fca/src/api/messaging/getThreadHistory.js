module.exports = function(api) {
  return async function(threadID, limit = 20) {
    return { threadID, messages: [] };
  };
};
module.exports.credits = "SARDAR RDX";
