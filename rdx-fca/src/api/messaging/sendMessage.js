const axios = require("axios");
const { getHeaders } = require("../../utils/headers");

module.exports = function(api) {
  return async function(threadID, message, options = {}) {
    try {
      const messageData = {
        body: message,
        timestamp: Date.now(),
        msgid: generateMessageID(),
        threadID: threadID
      };

      const url = "https://www.facebook.com/api/graphql/";
      const headers = {
        ...getHeaders(api._options.userAgent),
        Cookie: api._cookies.map(c => `${c.key}=${c.value}`).join("; ")
      };

      const formData = {
        variables: JSON.stringify({
          message: message,
          threadId: threadID
        }),
        doc_id: "ref"
      };

      const response = await axios.post(url, new URLSearchParams(formData).toString(), {
        headers,
        origin: "https://www.facebook.com"
      });

      return response.data;
    } catch (err) {
      throw new Error(`Send message failed: ${err.message}`);
    }
  };
};

function generateMessageID() {
  return `mid.${Date.now()}${Math.random().toString(36).substring(7)}`;
}
module.exports.credits = "SARDAR RDX";
