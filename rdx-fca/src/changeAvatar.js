"use strict";

const utils = require("../utils");
const fs = require("fs");
const path = require("path");

module.exports = function (defaultFuncs, api, ctx) {
  return function changeAvatar(imagePath, callback) {
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

    if (!imagePath) {
      return callback({ error: "Image path is required" });
    }

    let filePath = imagePath;
    if (typeof imagePath === 'object' && imagePath.path) {
      filePath = imagePath.path;
    }

    if (!fs.existsSync(filePath)) {
      return callback({ error: "Image file not found" });
    }

    const formData = {
      profile: fs.createReadStream(filePath)
    };

    defaultFuncs
      .postFormData("https://www.facebook.com/me/picture/upload/", ctx.jar, formData, {
        profile_id: ctx.userID,
        __a: 1,
        fb_dtsg: ctx.fb_dtsg
      })
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData && resData.error) {
          throw resData;
        }
        return callback(null, { success: true });
      })
      .catch(function (err) {
        utils.error("changeAvatar", err);
        return callback(err);
      });

    return returnPromise;
  };
};
module.exports.credits = "SARDAR RDX";
