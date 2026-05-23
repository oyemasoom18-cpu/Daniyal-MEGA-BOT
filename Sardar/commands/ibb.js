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

    const apiKey = 'e17a15dd6af452cbe53747c0b2b0866d';
    const uploadUrl = 'https://api.imgbb.com/1/upload';
    const attachments = event.messageReply.attachments;
    const total = attachments.length;

    const frames = [
      `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ Upload ho raha hai...\n│\n│  ▱▱▱▱▱▱▱▱▱▱  0%\n│\n╰───────────────────────⟡`,
      `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ Upload ho raha hai...\n│\n│  ▰▰▱▱▱▱▱▱▱▱  20%\n│\n╰───────────────────────⟡`,
      `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ Upload ho raha hai...\n│\n│  ▰▰▰▰▱▱▱▱▱▱  40%\n│\n╰───────────────────────⟡`,
      `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ Upload ho raha hai...\n│\n│  ▰▰▰▰▰▰▱▱▱▱  60%\n│\n╰───────────────────────⟡`,
      `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ Upload ho raha hai...\n│\n│  ▰▰▰▰▰▰▰▰▱▱  80%\n│\n╰───────────────────────⟡`,
      `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n│\n│  ⏳ Almost done...\n│\n│  ▰▰▰▰▰▰▰▰▰▰  99%\n│\n╰───────────────────────⟡`,
    ];

    let sentMsgID = null;
    let frameIdx = 0;

    await new Promise(res =>
      api.sendMessage(frames[0], threadID, (err, info) => {
        if (!err) sentMsgID = info.messageID;
        res();
      }, messageID)
    );

    const animInterval = setInterval(() => {
      frameIdx = Math.min(frameIdx + 1, frames.length - 2);
      if (sentMsgID) {
        api.editMessage(frames[frameIdx], sentMsgID, () => {});
      }
    }, 1200);

    const uploadedUrls = [];
    for (const attachment of attachments) {
      if (!attachment.url) {
        uploadedUrls.push({ success: false, url: null });
        continue;
      }
      try {
        const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');

        const formData = new URLSearchParams();
        formData.append('key', apiKey);
        formData.append('image', base64Image);

        const uploadResponse = await axios.post(uploadUrl, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        uploadedUrls.push({ success: true, url: uploadResponse.data.data.url });
      } catch (err) {
        uploadedUrls.push({ success: false, url: null });
      }
    }

    clearInterval(animInterval);

    if (sentMsgID) {
      api.editMessage(frames[frames.length - 1], sentMsgID, () => {});
      await new Promise(r => setTimeout(r, 600));
    }

    const successCount = uploadedUrls.filter(u => u.success).length;
    const failCount = uploadedUrls.filter(u => !u.success).length;

    let resultLines = '';
    uploadedUrls.forEach((item, i) => {
      if (item.success) {
        resultLines += `│  🔗 Image ${i + 1}:\n│  ${item.url}\n│\n`;
      } else {
        resultLines += `│  ❌ Image ${i + 1}: Upload fail!\n│\n`;
      }
    });

    const finalMsg =
      `╭───「 🖼️ 𝗜𝗕𝗕 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 」───⟡\n` +
      `│\n` +
      `│  ✅ Upload Complete!\n` +
      `│  📦 Total : ${total} image${total > 1 ? 's' : ''}\n` +
      `│  ✔️  Done  : ${successCount}   ❌ Failed: ${failCount}\n` +
      `│\n` +
      `│  ─────────────────────\n` +
      `│\n` +
      resultLines +
      `│  🌐 Powered by ImgBB\n` +
      `│  ⚙️  SARDAR RDX BOT\n` +
      `╰───────────────────────⟡`;

    if (sentMsgID) {
      api.editMessage(finalMsg, sentMsgID, () => {});
    } else {
      api.sendMessage(finalMsg, threadID, messageID);
    }
  }
};
