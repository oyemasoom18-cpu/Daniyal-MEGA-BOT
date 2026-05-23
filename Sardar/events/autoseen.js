const path = require('path');
const logs = require(path.join(__dirname, '../../controller/utility/logs'));

module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'autoseen',
    eventType: 'message',
    description: 'Auto mark messages as seen.'
  },
  async run({ api, event, Threads, config }) {
    const { threadID } = event;
    
    try {
      const settings = await Threads.getSettings(threadID);
      
      if (settings.autoseen === true) {
        api.markAsRead(threadID, (err) => {
          if (err) logs.error('AUTOSEEN', err?.message || err);
        });
      }
    } catch (e) {
      logs.error('AUTOSEEN', e.message);
    }
  }
};
