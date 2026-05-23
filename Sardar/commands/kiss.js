const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const kissGifs = [
  "https://i.postimg.cc/yxDKkJyH/02d4453f3eb0a76a87148433395b3ec3.gif",
  "https://i.postimg.cc/nLTf2Kdx/1483589602-6b6484adddd5d3e70b9eaaaccdf6867e.gif",
  "https://i.postimg.cc/Wpyjxnsb/574fcc797b21e-1533876813029926506824.gif",
  "https://i.postimg.cc/xdsT8SVL/kiss-anime.gif",
];

const kissMsgs = [
  (sender, victim) =>
    `╭─── « 💋 𝐒𝐖𝐄𝐄𝐓 𝐊𝐈𝐒𝐒 » ───⟡\n│\n│ 💝 ${sender} ne ${victim} ko\n│    pyar se kiss diya! 😘\n│\n│ 🌸 "Dil se dil milta hai,\n│    lafzon ki zaroorat nahi!"\n│\n│ 💞 — SARDAR RDX BOT\n╰───────────────⟡`,
  (sender, victim) =>
    `╭─── « ❤️ 𝐋𝐎𝐕𝐄 𝐀𝐓𝐓𝐀𝐂𝐊 » ───⟡\n│\n│ 😍 ${sender} → ${victim}\n│    Muah! 💋\n│\n│ 🌹 Ishq mein pagal ho gaye!\n│\n│ 💕 — SARDAR RDX BOT\n╰───────────────⟡`,
  (sender, victim) =>
    `╭─── « 🌺 𝐑𝐎𝐌𝐀𝐍𝐓𝐈𝐂 » ───⟡\n│\n│ 💘 ${sender} ne ${victim} ko\n│    kiss karke khush kar diya! 😘\n│\n│ ✨ Yeh lamha yaad rahega!\n│\n│ 💖 — SARDAR RDX BOT\n╰───────────────⟡`,
];

module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: "kiss",
    aliases: ["smooch", "muah", "pyar"],
    description: "Kisi ko pyar se kiss do — with anime gif!",
    usage: "kiss [@mention / reply]",
    category: "Fun",
    prefix: true,
    cooldowns: 5
  },

  async run({ api, event, send, Users }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    let victimID = null;
    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length > 0) {
      victimID = mentionKeys[0];
    } else if (messageReply) {
      victimID = messageReply.senderID;
    }

    if (!victimID) {
      return send.reply(
        `╭─── « 💋 KISS COMMAND » ───⟡\n│\n│ ⚠️ Kisi ko tag karo ya\n│    uske message pe reply karo!\n│\n│ 💡 Usage: .kiss @naam\n│\n│ 💖 — SARDAR RDX BOT\n╰───────────────⟡`
      );
    }

    if (victimID === senderID) {
      return send.reply(
        `╭─── « ❌ ERROR » ───⟡\n│\n│ 😂 Apne aap ko kiss nahi\n│    kar sakte bhai!\n│\n│ 💡 Kisi aur ko tag karo!\n│\n╰───────────────⟡`
      );
    }

    try {
      api.setMessageReaction("💋", messageID, () => {}, true);
    } catch {}

    try {
      const senderName = await Users.getNameUser(senderID).catch(() => "Bae");
      const victimName = await Users.getNameUser(victimID).catch(() => "Jaan");

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const gifUrl = kissGifs[Math.floor(Math.random() * kissGifs.length)];
      const gifPath = path.join(cacheDir, `kiss_${Date.now()}.gif`);
      const response = await axios.get(gifUrl, { responseType: "arraybuffer", timeout: 15000 });
      await fs.writeFile(gifPath, Buffer.from(response.data));

      const msg = kissMsgs[Math.floor(Math.random() * kissMsgs.length)](senderName, victimName);

      await new Promise((resolve, reject) => {
        api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream(gifPath),
            mentions: [
              { tag: senderName, id: senderID },
              { tag: victimName, id: victimID }
            ]
          },
          threadID,
          async (err, info) => {
            await fs.unlink(gifPath).catch(() => {});
            if (err) return reject(err);
            resolve(info);
          },
          messageID
        );
      });
    } catch (err) {
      console.error("[kiss]", err);
      send.reply("❌ Kiss bhejne mein masla aaya! Dobara try karo. 😅");
    }
  }
};
