module.exports = function(api) {
  return function(size, emoji) {
    return `https://static.xx.fbcdn.net/images/emoji.php/v9/${size}/${emoji}`;
  };
};
module.exports.credits = "SARDAR RDX";
