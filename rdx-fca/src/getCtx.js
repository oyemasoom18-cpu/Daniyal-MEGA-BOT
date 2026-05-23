"use strict";

module.exports = function (defaultFuncs, api, ctx) {
  return (str) => ctx[str];
};

module.exports.credits = "SARDAR RDX";
