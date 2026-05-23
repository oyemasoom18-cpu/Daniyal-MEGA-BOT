const axios = require("axios");

module.exports = function(api) {
  return async function(url, options = {}) {
    const headers = {
      "User-Agent": api._options.userAgent,
      "Cookie": api._cookies.map(c => `${c.key}=${c.value}`).join("; ")
    };
    return await axios.get(url, { headers, ...options });
  };
};
module.exports.credits = "SARDAR RDX";
