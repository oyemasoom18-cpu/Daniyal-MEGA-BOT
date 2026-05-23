"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function addUserToFriend(userID, callback) {
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

    if (!userID) {
      return callback({ error: "User ID is required" });
    }

    const form = {
      fb_dtsg: ctx.fb_dtsg,
      jazoest: ctx.jazoest,
      ids: JSON.stringify([userID]),
      reason: "profile_button"
    };

    defaultFuncs
      .post("https://www.facebook.com/ajax/friends/send_friend_request/?fb_dtsg=" + ctx.fb_dtsg, ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (!resData) {
          return callback({ error: "Empty response" });
        }
        if (resData.error) {
          throw { error: resData.error || "Failed to send friend request" };
        }
        return callback(null, { success: true, message: "Friend request sent" });
      })
      .catch(function (err) {
        utils.error("addUserToFriend", err);
        return callback(err);
      });

    return returnPromise;
  };
};
module.exports.credits = "SARDAR RDX";
