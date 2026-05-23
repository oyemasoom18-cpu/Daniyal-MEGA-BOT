module.exports = function(api) {
  return function(userID) {
    return `https://graph.facebook.com/v17.0/${userID}/picture`;
  };
};
module.exports.credits = "SARDAR RDX";
