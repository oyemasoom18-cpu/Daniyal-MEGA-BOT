module.exports = function(api) {
  return function(message, threadID, time) {
    return { scheduled: true, time };
  };
};
module.exports.credits = "SARDAR RDX";
