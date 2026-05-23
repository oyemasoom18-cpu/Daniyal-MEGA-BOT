const axios = require("axios");

module.exports = function(api) {
  return async function() {
    try {
      const url = "https://www.facebook.com/logout.php";
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": api._options.userAgent,
        "Cookie": api._cookies.map(c => `${c.key}=${c.value}`).join("; ")
      };

      await axios.post(url, new URLSearchParams({
        confirm: 1
      }).toString(), { headers });

      return { success: true };
    } catch (err) {
      throw new Error(`Logout failed: ${err.message}`);
    }
  };
};
module.exports.credits = "SARDAR RDX";
