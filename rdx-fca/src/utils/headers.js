function getHeaders(userAgent) {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    "Referer": "https://www.facebook.com/",
    "Origin": "https://www.facebook.com/",
    "User-Agent": userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
  };
}

function getMainHeaders(userAgent) {
  return {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate",
    "content-type": "application/x-www-form-urlencoded",
    "user-agent": userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "x-requested-with": "XMLHttpRequest"
  };
}

module.exports = { getHeaders, getMainHeaders };
module.exports.credits = "SARDAR RDX";
