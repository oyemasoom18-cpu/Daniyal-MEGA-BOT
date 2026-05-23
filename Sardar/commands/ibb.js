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

    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      event.messageReply.attachments.length === 0
    ) {
      return api.sendMessage(
        `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n` +
        `│\n` +
        `│  ❌ Kisi image ka reply karo!\n` +
        `│\n` +
        `│  📌 Usage:\n` +
        `│     Pehle image bhejo, phir\n` +
        `│     us pe .ibb reply karo\n` +
        `│\n` +
        `│  💡 Multiple images bhi\n` +
        `│     upload ho sakti hain!\n` +
        `│\n` +
        `╰───────────────────────⟡`,
        threadID,
        messageID
      );
    }

    // Filter only actual images (not stickers/audio/video)
    const allAttachments = event.messageReply.attachments;
    const attachments = allAttachments.filter(a => {
      const type = (a.type || '').toLowerCase();
      return type === 'photo' || type === 'image' || type === 'sticker' ||
             (!type && (a.url || a.previewUrl || a.largePreviewUrl));
    });

    if (attachments.length === 0) {
      return api.sendMessage(
        `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ❌ Koi valid image nahi\n│     mili reply mein!\n│\n╰───────────────────────⟡`,
        threadID, messageID
      );
    }

    const apiKey = 'e17a15dd6af452cbe53747c0b2b0866d';
    const uploadUrl = 'https://api.imgbb.com/1/upload';
    const total = attachments.length;

    // Send initial progress message
    let sentMsgID = null;
    await new Promise(res =>
      api.sendMessage(
        `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ ${total} image${total > 1 ? 's' : ''} upload\n│     ho rahi hain...\n│\n│  ▱▱▱▱▱▱▱▱▱▱  0/${total}\n│\n╰───────────────────────⟡`,
        threadID, (err, info) => { if (!err) sentMsgID = info?.messageID; res(); }, messageID
      )
    );

    const editMsg = (txt) => { if (sentMsgID) try { api.editMessage(txt, sentMsgID, () => {}); } catch {} };

    const uploadedUrls = [];

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];

      // Update progress
      const bars = '▰'.repeat(Math.round(((i) / total) * 10)) + '▱'.repeat(10 - Math.round(((i) / total) * 10));
      editMsg(
        `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ Uploading image ${i + 1}/${total}\n│\n│  ${bars}\n│  ${i}/${total} done\n│\n╰───────────────────────⟡`
      );

      // Get best available URL for this attachment
      const imgUrl = attachment.url || attachment.previewUrl || attachment.largePreviewUrl || attachment.thumbnailUrl || null;

      if (!imgUrl) {
        uploadedUrls.push({ success: false, url: null, error: 'No URL' });
        continue;
      }

      let uploaded = false;
      let lastError = '';

      // Try up to 2 times per image
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await axios.get(imgUrl, {
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0',
              'Referer': 'https://www.facebook.com/'
            }
          });

          const base64Image = Buffer.from(response.data, 'binary').toString('base64');

          const formData = new URLSearchParams();
          formData.append('key', apiKey);
          formData.append('image', base64Image);

          const uploadResponse = await axios.post(uploadUrl, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 20000
          });

          const link = uploadResponse.data?.data?.url || uploadResponse.data?.data?.display_url;
          if (link) {
            uploadedUrls.push({ success: true, url: link });
            uploaded = true;
            break;
          } else {
            lastError = 'ImgBB returned no URL';
          }
        } catch (err) {
          lastError = err?.response?.data?.error?.message || err.message || 'Unknown error';
          if (attempt < 2) await new Promise(r => setTimeout(r, 1500));
        }
      }

      if (!uploaded) {
        uploadedUrls.push({ success: false, url: null, error: lastError });
      }

      // Delay between uploads to avoid rate limiting
      if (i < attachments.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Build result message
    const successCount = uploadedUrls.filter(u => u.success).length;
    const failCount = uploadedUrls.filter(u => !u.success).length;

    let resultLines = '';
    uploadedUrls.forEach((item, i) => {
      if (item.success) {
        resultLines += `│  ✅ Image ${i + 1}:\n│  ${item.url}\n│\n`;
      } else {
        resultLines += `│  ❌ Image ${i + 1}: ${item.error || 'Upload fail!'}\n│\n`;
      }
    });

    editMsg(
      `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n` +
      `│\n` +
      `│  ✅ Upload Complete!\n` +
      `│  📦 Total  : ${total}\n` +
      `│  ✔️  Done   : ${successCount}   ❌ Fail: ${failCount}\n` +
      `│\n` +
      `│  ─────────────────────\n` +
      `│\n` +
      resultLines +
      `│  🌐 Powered by ImgBB\n` +
      `╰───────────────────────⟡`
    );
  }
};
