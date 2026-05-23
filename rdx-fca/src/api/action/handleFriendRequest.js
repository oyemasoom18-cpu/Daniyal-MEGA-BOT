const axios = require("axios");

module.exports = function(api) {
  return async function(userID, accept = true) {
    try {
      const url = "https://www.facebook.com/api/graphql/";
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": api._options.userAgent,
        "Cookie": api._cookies.map(c => `${c.key}=${c.value}`).join("; ")
      };

      const formData = {
        variables: JSON.stringify({
          user_id: userID,
          action: accept ? "ACCEPT" : "IGNORE"
        }),
        doc_id: "handle_friend_request"
      };

      const response = await axios.post(url, new URLSearchParams(formData).toString(), {
        headers
      });

      return response.data;
    } catch (err) {
      throw new Error(`Handle friend request failed: ${err.message}`);
    }
  };
};
module.exports.credits = "SARDAR RDX";
