"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function getFriendRequests(callback) {
    let resolveFunc = function () { };
    let rejectFunc = function () { };
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, result) {
        if (err) return rejectFunc(err);
        resolveFunc(result);
      };
    }

    const form = {
      fb_dtsg: ctx.fb_dtsg,
      jazoest: ctx.jazoest,
      floc: "friend_requests",
      ref: "/reqs.php"
    };

    defaultFuncs
      .post("https://www.facebook.com/ajax/friends/requests/browse/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (!resData) {
          return callback(null, { incoming: [], outgoing: [] });
        }
        if (resData.error) {
          throw resData;
        }

        const incoming = [];
        const outgoing = [];

        try {
          const payload = resData.payload || resData;
          
          if (payload.friendRequests && payload.friendRequests.entries) {
            for (const req of payload.friendRequests.entries) {
              incoming.push({
                userID: req.to.id || req.to,
                name: req.to.name || req.to.text || 'Unknown',
                timestamp: req.timestamp || Date.now()
              });
            }
          }
        } catch (e) {
          utils.error("getFriendRequests parse error", e);
        }

        return callback(null, { incoming, outgoing });
      })
      .catch(function (err) {
        utils.error("getFriendRequests", err);
        return callback(err);
      });

    return returnPromise;
  };
};
module.exports.credits = "SARDAR RDX";
