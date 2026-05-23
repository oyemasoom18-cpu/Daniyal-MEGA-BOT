const axios = require("axios");

module.exports = function(api) {
  return async function(limit = 20) {
    try {
      const url = "https://www.facebook.com/api/graphql/";
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": api._options.userAgent,
        "Cookie": api._cookies.map(c => `${c.key}=${c.value}`).join("; ")
      };

      const formData = {
        variables: JSON.stringify({ count: limit }),
        doc_id: "search_threads"
      };

      const response = await axios.post(url, new URLSearchParams(formData).toString(), {
        headers
      });

      return response.data;
    } catch (err) {
      throw new Error(`Get thread list failed: ${err.message}`);
    }
  };
};
module.exports.credits = "SARDAR RDX";
