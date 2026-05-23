module.exports = function(api) {
  return function(name, module) {
    api[name] = module;
    return true;
  };
};
module.exports.credits = "SARDAR RDX";
