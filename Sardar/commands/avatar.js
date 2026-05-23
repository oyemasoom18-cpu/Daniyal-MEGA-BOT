const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

function bold(t) {
  const map = { a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵' };
  return String(t).split('').map(c => map[c] || c).join('');
}

module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'avatar',
    aliases: ['avt', 'profilepic', 'dp'],
    description: 'Kisi ki profile picture dekho.',
    usage: 'avatar [@mention / reply / uid]',
    category: 'Media',
    adminOnly: false,
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { senderID, mentions, messageReply } = event;

    let uid = senderID;
    if (Object.keys(mentions).length > 0) {
      uid = Object.keys(mentions)[0];
    } else if (args[0] && /^\d+$/.test(args[0])) {
      uid = args[0];
    } else if (messageReply) {
      uid = messageReply.senderID;
    }

    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const avatarPath = path.join(cacheDir, `avatar_${uid}_${Date.now()}.jpg`);

    try {
      let name = 'Unknown';
      try {
        const info = await api.getUserInfo(uid);
        name = info[uid]?.name || 'Unknown';
      } catch {}

      const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const response = await axios.get(avatarUrl, { responseType: 'arraybuffer', timeout: 20000 });
      fs.writeFileSync(avatarPath, Buffer.from(response.data));

      await api.sendMessage({
        body:
          `╭─── « 🖼️ PROFILE PICTURE » ───⟡\n` +
          `│\n` +
          `│ ◈ ${bold('Name')} : ${name}\n` +
          `│ ◈ ${bold('UID')}  : ${uid}\n` +
          `│\n` +
          `│ 👑 SARDAR RDX BOT\n` +
          `╰───────────────⟡`,
        attachment: fs.createReadStream(avatarPath)
      }, event.threadID, event.messageID);

      setTimeout(() => { try { fs.unlinkSync(avatarPath); } catch {} }, 10000);

    } catch (error) {
      try { fs.unlinkSync(avatarPath); } catch {}
      return send.reply(
        `╭─── « ❌ ERROR » ───⟡\n` +
        `│\n` +
        `│ 😔 Profile picture nahi\n` +
        `│    mili!\n` +
        `│ ◈ ${error.message}\n` +
        `│\n` +
        `│ 🔁 Dobara try karo.\n` +
        `╰───────────────⟡`
      );
    }
  }
};
