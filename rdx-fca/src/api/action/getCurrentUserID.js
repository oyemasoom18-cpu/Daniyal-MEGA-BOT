module.exports = function(api) {
  return function() {
    return api._userID || null;
  };
};
module.exports.credits = "SARDAR RDX";
