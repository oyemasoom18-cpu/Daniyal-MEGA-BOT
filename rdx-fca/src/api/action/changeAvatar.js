const axios = require("axios");
const fs = require("fs");

module.exports = function(api) {
  return async function(imagePath) {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error("Image file not found");
      }

      const url = "https://www.facebook.com/api/graphql/";
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": api._options.userAgent,
        "Cookie": api._cookies.map(c => `${c.key}=${c.value}`).join("; ")
      };

      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString("base64");

      const formData = {
        variables: JSON.stringify({
          profile_picture: {
            profile_id: api.getCurrentUserID(),
            image: base64Image
          }
        }),
        doc_id: "change_avatar"
      };

      const response = await axios.post(url, new URLSearchParams(formData).toString(), {
        headers
      });

      return response.data;
    } catch (err) {
      throw new Error(`Change avatar failed: ${err.message}`);
    }
  };
};
module.exports.credits = "SARDAR RDX";
