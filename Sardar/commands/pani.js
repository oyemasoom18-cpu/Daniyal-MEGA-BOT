const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'pani',
    aliases: ['water', 'paani', 'thanda'],
    description: 'Pani ki thandi image bhejo.',
    usage: 'pani',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/N2LHDfbx/c36d30e80175.jpg",
      "https://i.ibb.co/LhpTKpzD/bedb4648ffa1.jpg",
      "https://i.ibb.co/pvwhWRrt/4a620e07c13e.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `pani_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 💧 PANI » ───⟡\n│\n│ 💧 Ye lo thanda pani\n│    aapke liye! 😊\n│\n│ 👑 SARDAR RDX BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
