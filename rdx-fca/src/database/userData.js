const { saveUser, getUser, getDB } = require("./helpers");

async function setUserData(userID, key, value) {
  try {
    const user = await getUser(userID);
    if (!user) {
      const newUser = await saveUser({
        userID,
        [key]: value
      });
      return newUser;
    }

    const data = user.data ? JSON.parse(user.data) : {};
    data[key] = value;
    user.data = JSON.stringify(data);
    await user.save();
    return user;
  } catch (err) {
    console.error("[RDX-FCA] Set user data error:", err.message);
    return null;
  }
}

async function getUserData(userID, key) {
  try {
    const user = await getUser(userID);
    if (!user || !user.data) return null;
    
    const data = JSON.parse(user.data);
    return key ? data[key] : data;
  } catch (err) {
    console.error("[RDX-FCA] Get user data error:", err.message);
    return null;
  }
}

async function getAllUserData(userID) {
  return await getUserData(userID);
}

async function removeUserData(userID, key) {
  try {
    const user = await getUser(userID);
    if (!user || !user.data) return false;

    const data = JSON.parse(user.data);
    delete data[key];
    user.data = JSON.stringify(data);
    await user.save();
    return true;
  } catch (err) {
    console.error("[RDX-FCA] Remove user data error:", err.message);
    return false;
  }
}

module.exports = {
  setUserData,
  getUserData,
  getAllUserData,
  removeUserData
};
module.exports.credits = "SARDAR RDX";
