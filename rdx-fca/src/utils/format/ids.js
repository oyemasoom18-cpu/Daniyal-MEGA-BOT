function getThreadID(id) {
  if (!id) return null;
  return id.toString();
}

function getUserID(id) {
  if (!id) return null;
  return id.toString();
}

function isGroupThread(threadID) {
  if (!threadID) return false;
  return threadID.toString().length > 15;
}

function isUserThread(threadID) {
  return !isGroupThread(threadID);
}

function parseThreadID(threadID) {
  const str = threadID.toString();
  if (str.includes(":")) {
    const parts = str.split(":");
    return {
      threadID: parts[0],
      userID: parts[1]
    };
  }
  return { threadID: str };
}

module.exports = {
  getThreadID,
  getUserID,
  isGroupThread,
  isUserThread,
  parseThreadID
};
module.exports.credits = "SARDAR RDX";
