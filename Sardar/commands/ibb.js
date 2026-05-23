module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'ibb',
    aliases: ['imgbb', 'uploadimg'],
    description: 'Upload images to ImgBB and get a shareable link.',
    usage: 'ibb [reply to one or more images]',
    category: 'Utility',
    prefix: true,
    cooldowns: 5
  },

  async run({ api, event }) {
    const axios = require('axios');
    const { threadID, messageID } = event;
    const reply = event.messageReply;

    if (!reply || !reply.attachments || reply.attachments.length === 0) {
      return api.sendMessage(
        `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ❌ Image ka reply karo!\n│\n│  📌 Pehle image bhejo,\n│     phir .ibb reply karo\n│\n╰───────────────────────⟡`,
        threadID
      );
    }

    const attachments = reply.attachments;
    const total = attachments.length;
    const apiKey = 'e17a15dd6af452cbe53747c0b2b0866d';

    // Send initial status
    let statusMID = null;
    await new Promise(res =>
      api.sendMessage(
        `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ ${total} images upload\n│     ho rahi hain...\n│  ⚡ Parallel processing!\n│\n╰───────────────────────⟡`,
        threadID,
        (err, info) => { statusMID = info?.messageID; res(); },
        messageID
      )
    );

    const editStatus = (txt) => {
      if (statusMID) try { api.editMessage(txt, statusMID, () => {}); } catch {}
    };

    // Upload single image with timeout safety
    async function uploadOne(att, index) {
      const imgUrl = att.url || att.previewUrl || att.largePreviewUrl ||
                     att.thumbnailUrl || att.preview_url || null;

      if (!imgUrl) return { n: index + 1, ok: false, err: 'URL nahi mila' };

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const imgRes = await axios.get(imgUrl, {
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0',
              'Referer': 'https://www.facebook.com/'
            }
          });

          const b64 = Buffer.from(imgRes.data).toString('base64');
          const form = new URLSearchParams();
          form.append('key', apiKey);
          form.append('image', b64);

          const upRes = await axios.post('https://api.imgbb.com/1/upload', form.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 20000
          });

          const link = upRes.data?.data?.url;
          if (link) return { n: index + 1, ok: true, url: link };

        } catch (e) {
          if (attempt === 1) await new Promise(r => setTimeout(r, 1000));
        }
      }
      return { n: index + 1, ok: false, err: 'Upload fail' };
    }

    // Run all uploads in parallel — no waiting between them
    const results = await Promise.all(
      attachments.map((att, i) => uploadOne(att, i))
    );

    // Sort by index
    results.sort((a, b) => a.n - b.n);

    const success = results.filter(r => r.ok).length;
    const fail = results.filter(r => !r.ok).length;

    let lines = '';
    for (const r of results) {
      if (r.ok) {
        lines += `│  ✅ Image ${r.n}: ${r.url}\n│\n`;
      } else {
        lines += `│  ❌ Image ${r.n}: ${r.err || 'Fail'}\n│\n`;
      }
    }

    editStatus(
      `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n` +
      `│\n` +
      `│  ✅ Complete!\n` +
      `│  📦 Total : ${total}\n` +
      `│  ✔️  Done  : ${success}   ❌ Fail: ${fail}\n` +
      `│\n│  ─────────────────────\n│\n` +
      lines +
      `│  🌐 ImgBB  |  SARDAR RDX\n` +
      `╰───────────────────────⟡`
    );
  }
};
