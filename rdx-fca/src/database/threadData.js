const { saveThread, getThread, getAllThreads, deleteThread } = require("./helpers");

async function setThreadData(threadID, key, value) {
  try {
    let thread = await getThread(threadID);
    
    if (!thread) {
      thread = await saveThread({
        threadID,
        [key]: value
      });
      return thread;
    }

    const data = thread.data ? JSON.parse(thread.data) : {};
    data[key] = value;
    thread.data = JSON.stringify(data);
    await thread.save();
    return thread;
  } catch (err) {
    console.error("[RDX-FCA] Set thread data error:", err.message);
    return null;
  }
}

async function getThreadData(threadID, key) {
  try {
    const thread = await getThread(threadID);
    if (!thread || !thread.data) return null;

    const data = JSON.parse(thread.data);
    return key ? data[key] : data;
  } catch (err) {
    console.error("[RDX-FCA] Get thread data error:", err.message);
    return null;
  }
}

async function getAllThreadData(threadID) {
  return await getThreadData(threadID);
}

async function removeThreadData(threadID, key) {
  try {
    const thread = await getThread(threadID);
    if (!thread || !thread.data) return false;

    const data = JSON.parse(thread.data);
    delete data[key];
    thread.data = JSON.stringify(data);
    await thread.save();
    return true;
  } catch (err) {
    console.error("[RDX-FCA] Remove thread data error:", err.message);
    return false;
  }
}

module.exports = {
  setThreadData,
  getThreadData,
  getAllThreadData,
  removeThreadData,
  getAllThreads,
  deleteThread
};
module.exports.credits = "SARDAR RDX";
