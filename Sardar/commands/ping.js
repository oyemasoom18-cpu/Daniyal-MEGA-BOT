module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'ping',
    aliases: ['p', 'latency'],
    description: 'Check bot response speed.',
    usage: 'ping',
    category: 'Utility',
    prefix: true
  },
  async run({ api, event, send }) {
    const start = Date.now();
    const info = await send.reply('🏓 Pinging...');
    const latency = Date.now() - start;
    api.editMessage(`🏓 Pong!\n─────────────────\n⚡ Latency: ${latency}ms\n✅ Bot is Active`, info.messageID);
  }
};
