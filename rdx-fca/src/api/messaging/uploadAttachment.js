module.exports = function(api) {
  return async function(attachment, threadID) {
    return { attachment_id: Date.now() };
  };
};
module.exports.credits = "SARDAR RDX";
