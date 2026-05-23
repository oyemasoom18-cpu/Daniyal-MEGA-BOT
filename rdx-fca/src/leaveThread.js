"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function leaveThread(threadID, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err) {
        if (err) return rejectFunc(err);
        resolveFunc();
      };
    }

    // Primary approach: remove_participants with bot's own UID
    // This is how Facebook internally handles self-leave
    const form = {
      uid: ctx.userID,
      tid: threadID
    };

    defaultFuncs
      .post("https://www.facebook.com/chat/remove_participants", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData && resData.error) throw resData;
        return callback();
      })
      .catch(function () {
        // Fallback: leave_thread endpoint (older Facebook API path)
        const fallbackForm = {
          id: threadID,
          client: "mercury"
        };
        return defaultFuncs
          .post("https://www.facebook.com/ajax/mercury/leave_thread.php", ctx.jar, fallbackForm)
          .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
          .then(function (resData) {
            if (resData && resData.error) throw resData;
            return callback();
          })
          .catch(function (err2) {
            utils.error("leaveThread", err2);
            return callback(err2);
          });
      });

    return returnPromise;
  };
};

module.exports.credits = "SARDAR RDX";
