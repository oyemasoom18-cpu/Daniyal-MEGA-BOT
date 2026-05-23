const axios = require("axios");

module.exports = function(api) {
  return async function(threadID) {
    try {
      const url = "https://www.facebook.com/api/graphql/";
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": api._options.userAgent,
        "Cookie": api._cookies.map(c => `${c.key}=${c.value}`).join("; ")
      };

      const formData = {
        variables: JSON.stringify({ threadID }),
        doc_id: "thread_info"
      };

      const response = await axios.post(url, new URLSearchParams(formData).toString(), {
        headers
      });

      return response.data;
    } catch (err) {
      throw new Error(`Get thread info failed: ${err.message}`);
    }
  };
};
module.exports.credits = "SARDAR RDX";
