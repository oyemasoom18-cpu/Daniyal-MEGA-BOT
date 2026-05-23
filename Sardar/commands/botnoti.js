const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

const CONFIG_PATH = path.join(__dirname, '../../config.json');

function bold(str) {
  const map = {
    A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',
    L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',
    W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
    a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',
    l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',
    w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
    '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵'
  };
  return [...String(str)].map(c => map[c] || c).join('');
}

function saveConfig(cfg) {
  fs.writeJsonSync(CONFIG_PATH, cfg, { spaces: 2 });
}

module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'botnoti',
    aliases: ['botnoti', 'notiset'],
    description: 'Bot notifications ka group set karo — online, join, remove, spam alerts.',
    usage: 'botnoti set | botnoti off | botnoti status | botnoti test',
    category: 'Admin',
    prefix: true
  },

  async run({ api, event, args, config, isAdmin }) {
    const { threadID, senderID, messageID } = event;
    if (!isAdmin) {
      return api.sendMessage(
        `╭─── « ❌ ACCESS DENIED » ───⟡\n│\n│ ⊳ Sirf ${bold('Admin')} use kar sakta hai!\n│\n╰───────────────⟡`,
        threadID, messageID
      );
    }

    const sub = (args[0] || '').toLowerCase();
    const time = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm A | DD/MM/YYYY');

    if (sub === 'set') {
      const tid = args[1]?.trim();
      if (!tid || isNaN(tid)) {
        return api.sendMessage(
          `╭─── « ⚙️ BOTNOTI SET » ───⟡\n│\n│ ⊳ Group ka TID do!\n│\n│ ◈ Usage: .botnoti set [TID]\n│ ◈ TID kaise milega: .tid command\n│\n╰───────────────⟡`,
          threadID, messageID
        );
      }

      let groupName = 'Unknown';
      try {
        const info = await new Promise((res, rej) => api.getThreadInfo(tid, (e, d) => e ? rej(e) : res(d)));
        groupName = info.threadName || 'Unknown';
      } catch {}

      const cfg = fs.readJsonSync(CONFIG_PATH);
      cfg.NOTIFY_TID = tid;
      saveConfig(cfg);
      global.config.NOTIFY_TID = tid;
      config.NOTIFY_TID = tid;

      return api.sendMessage(
        `╭─── « ✅ BOTNOTI SET » ───⟡\n│\n│ ◈ ${bold('Group')} : ${groupName}\n│ ◈ ${bold('TID')}   : ${tid}\n│ ◈ ${bold('Time')}  : ${time}\n│\n│ 🔔 Ab yeh notifications aayengi:\n│ ┣ 🟢 Bot Online\n│ ┣ ➕ Bot Naye Group Mein\n│ ┣ 🚪 Bot Group Se Hata\n│ ┗ ⚠️ Spam Alert\n│\n╰───────────────⟡`,
        threadID, messageID
      );
    }

    if (sub === 'off') {
      const cfg = fs.readJsonSync(CONFIG_PATH);
      delete cfg.NOTIFY_TID;
      saveConfig(cfg);
      delete global.config.NOTIFY_TID;
      delete config.NOTIFY_TID;

      return api.sendMessage(
        `╭─── « 🔕 BOTNOTI OFF » ───⟡\n│\n│ ⊳ Notifications ${bold('band')} kar di gayi!\n│\n╰───────────────⟡`,
        threadID, messageID
      );
    }

    if (sub === 'status') {
      const tid = config.NOTIFY_TID;
      if (!tid) {
        return api.sendMessage(
          `╭─── « 📋 BOTNOTI STATUS » ───⟡\n│\n│ ⊳ Abhi koi notification group ${bold('set nahi')}!\n│ ◈ .botnoti set [TID] se set karo\n│\n╰───────────────⟡`,
          threadID, messageID
        );
      }

      let groupName = 'Unknown';
      try {
        const info = await new Promise((res, rej) => api.getThreadInfo(tid, (e, d) => e ? rej(e) : res(d)));
        groupName = info.threadName || 'Unknown';
      } catch {}

      return api.sendMessage(
        `╭─── « 📋 BOTNOTI STATUS » ───⟡\n│\n│ ◈ ${bold('Status')} : 🟢 Active\n│ ◈ ${bold('Group')}  : ${groupName}\n│ ◈ ${bold('TID')}    : ${tid}\n│ ◈ ${bold('Time')}   : ${time}\n│\n╰───────────────⟡`,
        threadID, messageID
      );
    }

    if (sub === 'test') {
      const tid = config.NOTIFY_TID;
      if (!tid) {
        return api.sendMessage(
          `╭─── « ❌ NO GROUP » ───⟡\n│\n│ ⊳ Pehle .botnoti set [TID] karo!\n│\n╰───────────────⟡`,
          threadID, messageID
        );
      }

      const uptime = process.uptime();
      const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60), s = Math.floor(uptime % 60);
      const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

      try {
        await api.sendMessage(
          `╭─── « 🔔 TEST NOTIFICATION » ───⟡\n│\n│ ✅ Notification system ${bold('kaam kar raha hai!')} \n│\n│ ◈ ${bold('Bot')}    : ${config.BOTNAME || 'SARDAR RDX BOT'}\n│ ◈ ${bold('Uptime')}: ${h}h ${m}m ${s}s\n│ ◈ ${bold('RAM')}    : ${mem} MB\n│ ◈ ${bold('Time')}   : ${time}\n│\n│ 👑 SARDAR RDX BOT\n╰───────────────⟡`,
          tid
        );
        api.sendMessage(
          `╭─── « ✅ TEST SENT » ───⟡\n│\n│ ⊳ Test notification us group mein bheji!\n│ ◈ TID: ${tid}\n│\n╰───────────────⟡`,
          threadID, messageID
        );
      } catch (e) {
        api.sendMessage(
          `╭─── « ❌ ERROR » ───⟡\n│\n│ ⊳ Send nahi ho saka!\n│ ◈ ${e.message}\n│ ◈ TID sahi hai?\n│\n╰───────────────⟡`,
          threadID, messageID
        );
      }
      return;
    }

    api.sendMessage(
      `╭─── « 🔔 BOTNOTI » ───⟡\n│\n│ 📖 ${bold('Commands')} :\n│\n│ ◈ .botnoti ${bold('set')} [TID]\n│      ↳ Notification group set karo\n│ ◈ .botnoti ${bold('off')}\n│      ↳ Notifications band karo\n│ ◈ .botnoti ${bold('status')}\n│      ↳ Current setting dekho\n│ ◈ .botnoti ${bold('test')}\n│      ↳ Test notification bhejo\n│\n│ 💡 TID kaise milega? → .tid\n│\n╰───────────────⟡`,
      threadID, messageID
    );
  }
};
