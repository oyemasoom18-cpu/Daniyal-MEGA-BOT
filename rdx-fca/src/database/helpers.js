const { initDatabase, getDatabase } = require("./models");

let dbCache = null;

async function getDB() {
  if (!dbCache) {
    dbCache = await initDatabase();
  }
  return dbCache;
}

async function saveUser(userData) {
  try {
    const db = await getDB();
    if (!db) return null;
    
    const [user, created] = await db.User.upsert({
      userID: userData.userID,
      name: userData.name || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      avatar: userData.avatar || null,
      data: JSON.stringify(userData)
    });
    return user;
  } catch (err) {
    console.error("[RDX-FCA] Save user error:", err.message);
    return null;
  }
}

async function getUser(userID) {
  try {
    const db = await getDB();
    if (!db) return null;
    return await db.User.findByPk(userID);
  } catch (err) {
    console.error("[RDX-FCA] Get user error:", err.message);
    return null;
  }
}

async function saveThread(threadData) {
  try {
    const db = await getDB();
    if (!db) return null;

    const thread = await db.Thread.upsert({
      threadID: threadData.threadID,
      name: threadData.name || null,
      participants: JSON.stringify(threadData.participants || []),
      participantIDs: JSON.stringify(threadData.participantIDs || []),
      threadType: threadData.threadType || "user",
      emoji: threadData.emoji || null,
      color: threadData.color || null,
      isGroup: threadData.isGroup || false,
      messageCount: threadData.messageCount || 0,
      lastActivity: threadData.lastActivity || Date.now(),
      data: JSON.stringify(threadData)
    });
    return thread;
  } catch (err) {
    console.error("[RDX-FCA] Save thread error:", err.message);
    return null;
  }
}

async function getThread(threadID) {
  try {
    const db = await getDB();
    if (!db) return null;
    return await db.Thread.findByPk(threadID);
  } catch (err) {
    console.error("[RDX-FCA] Get thread error:", err.message);
    return null;
  }
}

async function getAllThreads() {
  try {
    const db = await getDB();
    if (!db) return [];
    return await db.Thread.findAll({ order: [["lastActivity", "DESC"]] });
  } catch (err) {
    console.error("[RDX-FCA] Get all threads error:", err.message);
    return [];
  }
}

async function deleteThread(threadID) {
  try {
    const db = await getDB();
    if (!db) return false;
    await db.Thread.destroy({ where: { threadID } });
    return true;
  } catch (err) {
    console.error("[RDX-FCA] Delete thread error:", err.message);
    return false;
  }
}

module.exports = {
  initDatabase,
  getDB,
  saveUser,
  getUser,
  saveThread,
  getThread,
  getAllThreads,
  deleteThread
};
module.exports.credits = "SARDAR RDX";
