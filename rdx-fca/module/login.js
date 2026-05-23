const { getType } = require("../src/utils/format");
const { setOptions } = require("./options");
const { loadConfig } = require("./config");
const { checkAndUpdateVersion } = require("../func/checkUpdate");
const loginHelper = require("./loginHelper");
const logger = require("../func/logger");

function normalizeLoginData(data) {
  if (!data) return { appState: null, Cookie: null, email: null, password: null };
  
  let appState = null;
  let Cookie = null;
  let email = null;
  let password = null;

  if (Array.isArray(data)) {
    appState = data;
  } else if (typeof data === "object") {
    if (data.appState) {
      appState = data.appState;
    } else if (data.Cookie) {
      if (typeof data.Cookie === "string") {
        try {
          Cookie = JSON.parse(data.Cookie);
        } catch {
          Cookie = parseCookieString(data.Cookie);
        }
      } else {
        Cookie = data.Cookie;
      }
    } else if (data.email && data.password) {
      email = data.email;
      password = data.password;
    } else if (data.cookies) {
      appState = data.cookies;
    } else if (data.cookie) {
      if (typeof data.cookie === "string") {
        Cookie = parseCookieString(data.cookie);
      } else {
        Cookie = data.cookie;
      }
    }
  } else if (typeof data === "string") {
    try {
      appState = JSON.parse(data);
    } catch {
      Cookie = parseCookieString(data);
    }
  }

  return { appState, Cookie, email, password };
}

function parseCookieString(cookieStr) {
  return cookieStr.split(";").map(c => {
    const parts = c.trim().split("=");
    return { key: parts[0], value: parts[1] || "" };
  }).filter(c => c.key);
}

const { config } = loadConfig();
global.rdxFca = { config };

if (!global.rdxFca._errorHandlersInstalled) {
  global.rdxFca._errorHandlersInstalled = true;

  process.on("unhandledRejection", (reason, promise) => {
    try {
      if (reason && typeof reason === "object") {
        const errorCode = reason.code || reason.cause?.code;
        const errorMessage = reason.message || String(reason);

        if (errorMessage.includes("No Sequelize instance passed")) {
          return;
        }

        if (errorCode === "UND_ERR_CONNECT_TIMEOUT" ||
            errorCode === "ETIMEDOUT" ||
            errorMessage.includes("Connect Timeout") ||
            errorMessage.includes("fetch failed")) {
          logger(`[RDX-FCA] Network timeout error caught (non-fatal): ${errorMessage}`, "warn");
          return;
        }

        if (errorCode === "ECONNREFUSED" ||
            errorCode === "ENOTFOUND" ||
            errorCode === "ECONNRESET" ||
            errorMessage.includes("ECONNREFUSED") ||
            errorMessage.includes("ENOTFOUND")) {
          logger(`[RDX-FCA] Network connection error caught (non-fatal): ${errorMessage}`, "warn");
          return;
        }
      }

      logger(`[RDX-FCA] Unhandled promise rejection (non-fatal): ${reason && reason.message ? reason.message : String(reason)}`, "error");
    } catch (e) {
    }
  });

  process.on("uncaughtException", (error) => {
    try {
      const errorMessage = error.message || String(error);
      const errorCode = error.code;

      if (errorMessage.includes("No Sequelize instance passed")) {
        return;
      }

      if (errorCode === "UND_ERR_CONNECT_TIMEOUT" ||
          errorCode === "ETIMEDOUT" ||
          errorMessage.includes("Connect Timeout") ||
          errorMessage.includes("fetch failed")) {
        logger(`[RDX-FCA] Uncaught network timeout error (non-fatal): ${errorMessage}`, "warn");
        return;
      }

      logger(`[RDX-FCA] Uncaught exception (attempting to continue): ${errorMessage}`, "error");
    } catch (e) {
    }
  });
}

function login(loginData, options, callback) {
  if (getType(options) === "Function" || getType(options) === "AsyncFunction") {
    callback = options;
    options = {};
  }
  const globalOptions = {
    selfListen: false,
    selfListenEvent: false,
    listenEvents: false,
    listenTyping: false,
    updatePresence: false,
    forceLogin: false,
    autoMarkRead: false,
    autoReconnect: true,
    online: true,
    emitReady: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
  };
  setOptions(globalOptions, options);
  let prCallback = null;
  let rejectFunc = null;
  let resolveFunc = null;
  let returnPromise = null;
  if (getType(callback) !== "Function" && getType(callback) !== "AsyncFunction") {
    returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });
    prCallback = function (error, api) {
      if (error) return rejectFunc(error);
      return resolveFunc(api);
    };
    callback = prCallback;
  }
  const loginDataNormalized = normalizeLoginData(loginData);
  const proceed = () => loginHelper(loginDataNormalized.appState, loginDataNormalized.Cookie, loginDataNormalized.email, loginDataNormalized.password, globalOptions, callback, prCallback);
  if (config && config.autoUpdate) {
    const p = checkAndUpdateVersion();
    if (p && typeof p.then === "function") {
      p.then(proceed).catch(err => callback(err));
    } else {
      proceed();
    }
  } else {
    proceed();
  }
  return returnPromise;
}

module.exports = login;
module.exports.credits = "SARDAR RDX";
