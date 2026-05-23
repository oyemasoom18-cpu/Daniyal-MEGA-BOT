const axios = require("axios");

module.exports = function(api) {
  return async function(threadID, typingState = true) {
    try {
      const url = "https://www.facebook.com/ajax/messaging/typ.php";
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": api._options.userAgent,
        "Cookie": api._cookies.map(c => `${c.key}=${c.value}`).join("; ")
      };

      const formData = new URLSearchParams();
      formData.append("thread", threadID);
      formData.append("state", typingState ? "1" : "0");

      const response = await axios.post(url, formData.toString(), {
        headers
      });

      return response.data;
    } catch (err) {
      throw new Error(`Typing indicator failed: ${err.message}`);
    }
  };
};
module.exports.credits = "SARDAR RDX";
