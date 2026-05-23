const axios = require("axios");

module.exports = function(api) {
  return async function(url, data = {}, options = {}) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": api._options.userAgent,
      "Cookie": api._cookies.map(c => `${c.key}=${c.value}`).join("; ")
    };
    return await axios.post(url, new URLSearchParams(data).toString(), { headers, ...options });
  };
};
module.exports.credits = "SARDAR RDX";
