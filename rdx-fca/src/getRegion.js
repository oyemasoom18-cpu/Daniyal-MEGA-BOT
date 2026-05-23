"use strict";

module.exports = function (defaultFuncs, api, ctx) {
  return function getRegion() {
    return ctx?.region;
  };
};

module.exports.credits = "SARDAR RDX";
