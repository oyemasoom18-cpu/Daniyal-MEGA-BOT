module.exports = function(api) {
  return async function(username) {
    return { userID: username };
  };
};
module.exports.credits = "SARDAR RDX";
