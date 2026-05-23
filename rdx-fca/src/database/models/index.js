const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "..", "..", "..", "Fca_Database", "rdx_database.sqlite");

let sequelize = null;
let databaseReady = false;

async function initDatabase() {
  if (databaseReady) return getDatabase();

  try {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: false,
      transactionType: "IMMEDIATE"
    });

    const UserModel = require("./user")(sequelize);
    const ThreadModel = require("./thread")(sequelize);

    await sequelize.sync();
    databaseReady = true;

    return { sequelize, User: UserModel, Thread: ThreadModel };
  } catch (err) {
    console.error("[RDX-FCA] Database init error:", err.message);
    return null;
  }
}

function getDatabase() {
  if (!sequelize) return null;
  return { sequelize };
}

module.exports = { initDatabase, getDatabase };
module.exports.credits = "SARDAR RDX";
