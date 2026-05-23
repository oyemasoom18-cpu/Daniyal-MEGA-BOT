module.exports = function(api) {
  return async function(message, options = {}) {
    return { success: true, postID: Date.now() };
  };
};
module.exports.credits = "SARDAR RDX";
