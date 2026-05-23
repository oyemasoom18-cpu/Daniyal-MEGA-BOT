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

    // Send status message
    let statusMID = null;
    await new Promise(res =>
      api.sendMessage(
        `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ ${total} image upload\n│     ho rahi hai...\n│\n╰───────────────────────⟡`,
        threadID,
        (err, info) => { statusMID = info?.messageID; res(); },
        messageID
      )
    );

    const editStatus = (txt) => {
      if (statusMID) try { api.editMessage(txt, statusMID, () => {}); } catch {}
    };

    const results = [];

    for (let i = 0; i < attachments.length; i++) {
      const att = attachments[i];

      // Get image URL — try all possible fields
      const imgUrl = att.url || att.previewUrl || att.largePreviewUrl ||
                     att.thumbnailUrl || att.preview_url || att.image_data?.uri || null;

      editStatus(
        `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ Image ${i + 1}/${total}\n│     upload ho rahi hai...\n│\n╰───────────────────────⟡`
      );

      if (!imgUrl) {
        results.push({ n: i + 1, ok: false, url: null, err: 'URL nahi mila' });
        continue;
      }

      let done = false;
      let errMsg = '';

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // Download image
          const imgRes = await axios.get(imgUrl, {
            responseType: 'arraybuffer',
            timeout: 20000,
            headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.facebook.com/' }
          });

          const b64 = Buffer.from(imgRes.data).toString('base64');

          // Upload to ImgBB
          const form = new URLSearchParams();
          form.append('key', apiKey);
          form.append('image', b64);

          const upRes = await axios.post('https://api.imgbb.com/1/upload', form.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 25000
          });

          const link = upRes.data?.data?.url;
          if (link) {
            results.push({ n: i + 1, ok: true, url: link });
            done = true;
            break;
          } else {
            errMsg = 'ImgBB se link nahi mila';
          }
        } catch (e) {
          errMsg = e?.response?.data?.error?.message || e.message || 'Unknown';
          if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (!done) results.push({ n: i + 1, ok: false, url: null, err: errMsg });

      // Delay between uploads
      if (i < attachments.length - 1) await new Promise(r => setTimeout(r, 1200));
    }

    // Build final message
    const success = results.filter(r => r.ok).length;
    const fail = results.filter(r => !r.ok).length;

    let lines = '';
    for (const r of results) {
      if (r.ok) {
        lines += `│  ✅ Image ${r.n}:\n│  ${r.url}\n│\n`;
      } else {
        lines += `│  ❌ Image ${r.n}: ${r.err}\n│\n`;
      }
    }

    editStatus(
      `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n` +
      `│\n` +
      `│  ✅ Complete!\n` +
      `│  📦 Total : ${total}\n` +
      `│  ✔️  Done  : ${success}  ❌ Fail: ${fail}\n` +
      `│\n│  ─────────────────────\n│\n` +
      lines +
      `│  🌐 ImgBB  |  SARDAR RDX\n` +
      `╰───────────────────────⟡`
    );
  }
};
