module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'spamgc',
    aliases: ['spam', 'requestbox', 'pending'],
    description: 'Spam/Request/Pending folder ke groups dekho aur unhe accept karo.',
    usage: 'spamgc',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },

  spamData: new Map(),

  async run({ api, event, send, client, config }) {
    const { threadID, senderID } = event;

    const info = await new Promise(res =>
      api.sendMessage(
        `╭───「 ⚠️ 𝗦𝗣𝗔𝗠 𝗚𝗥𝗢𝗨𝗣𝗦 」───⟡\n│\n│  ⏳ Sab folders scan\n│     ho rahe hain...\n│\n╰───────────────────────⟡`,
        threadID,
        (err, d) => res(d),
        event.messageID
      )
    );
    const mid = info?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    try {
      const seenIDs = new Set();
      const allGroups = [];

      // Scan all possible folder tags where Facebook puts pending groups
      const foldersToTry = ['PENDING', 'OTHER', 'SPAM', 'spam', 'pending', 'other', ''];

      for (const tag of foldersToTry) {
        let timestamp = null;
        let attempts = 0;

        while (attempts < 5) {
          attempts++;
          let batch = [];
          try {
            batch = await new Promise((res, rej) =>
              api.getThreadList(100, timestamp, tag === '' ? [''] : [tag], (err, d) => {
                if (err) return rej(err);
                res(d || []);
              })
            );
          } catch {
            break;
          }

          if (!batch || !batch.length) break;

          for (const t of batch) {
            if (!t.isGroup) continue;
            if (seenIDs.has(t.threadID)) continue;
            seenIDs.add(t.threadID);
            allGroups.push({ ...t, _foundInFolder: tag });
          }

          if (batch.length < 100) break;
          timestamp = parseInt(batch[batch.length - 1].timestamp);
        }
      }

      if (allGroups.length === 0) {
        return edit(
          `╭───「 ✅ 𝗦𝗣𝗔𝗠 𝗚𝗥𝗢𝗨𝗣𝗦 」───⟡\n│\n│  ✅ Koi group nahi mila!\n│\n│  💡 Manual join karo:\n│     .join <threadID>\n│\n╰───────────────────────⟡`
        );
      }

      const spamList = [];
      let msg =
        `╭───「 ⚠️ 𝗦𝗣𝗔𝗠 𝗚𝗥𝗢𝗨𝗣𝗦 」───⟡\n` +
        `│\n` +
        `│  📋 Total: ${Math.min(allGroups.length, 20)} group(s)\n` +
        `│\n` +
        `│  ─────────────────────\n`;

      for (let i = 0; i < Math.min(allGroups.length, 20); i++) {
        const g = allGroups[i];
        const name = g.name || g.threadName || 'Unknown Group';
        const folder = g._foundInFolder || g.folder || '?';
        spamList.push({ index: i + 1, id: g.threadID, name, folder });
        msg += `│\n│  ${i + 1}. 📛 ${name}\n│      🆔 ${g.threadID}\n│      📁 ${folder} | 👥 ${g.participantIDs?.length || '?'}\n`;
      }

      if (allGroups.length > 20) {
        msg += `│\n│  ... aur ${allGroups.length - 20} more\n`;
      }

      msg +=
        `│\n│  ─────────────────────\n` +
        `│\n│  💬 Number reply karo\n` +
        `│  📌 Example: 1  ya  1,3,5\n` +
        `│  📌 Sab: all\n│\n` +
        `╰───────────────────────⟡`;

      edit(msg);
      this.spamData.set(threadID, spamList);

      if (mid) {
        client.replies.set(mid, {
          commandName: 'spamgc',
          author: senderID,
          data: { spamList, threadID }
        });
        setTimeout(() => {
          if (client.replies) client.replies.delete(mid);
          this.spamData.delete(threadID);
        }, 300000);
      }

    } catch (error) {
      edit(
        `╭───「 ❌ 𝗘𝗥𝗥𝗢𝗥 」───⟡\n│\n│  ${error.message}\n│\n╰───────────────────────⟡`
      );
    }
  },

  async handleReply({ api, event, send, client, data, config }) {
    const { body, senderID, threadID } = event;
    if (!body) return;

    const originalAuthor = data?.author;
    const isAdmin = config?.ADMINBOT?.includes(String(senderID));

    if (originalAuthor && String(senderID) !== String(originalAuthor) && !isAdmin) {
      return send.reply('❌ Sirf command use karne wala ya admin reply kar sakta hai.');
    }

    const spamList = data?.spamList || this.spamData.get(threadID);

    if (!spamList || spamList.length === 0) {
      return send.reply(
        `╭───「 ❌ 𝗘𝗥𝗥𝗢𝗥 」───⟡\n│\n│  Data expire ho gaya!\n│  Phir se .spamgc\n│  run karo.\n│\n╰───────────────────────⟡`
      );
    }

    const input = body.trim().toLowerCase();
    let toAccept = [];

    if (input === 'all') {
      toAccept = spamList;
    } else if (input.includes(',')) {
      const nums = input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      for (const num of nums) {
        const item = spamList.find(p => p.index === num);
        if (item) toAccept.push(item);
      }
    } else {
      const num = parseInt(input);
      if (!isNaN(num)) {
        const item = spamList.find(p => p.index === num);
        if (item) toAccept.push(item);
      }
    }

    if (toAccept.length === 0) {
      return send.reply(
        `╭───「 ❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 」───⟡\n│\n│  Sahi number type karo!\n│\n╰───────────────────────⟡`
      );
    }

    const info2 = await new Promise(res =>
      api.sendMessage(
        `╭───「 🔗 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗡𝗚 」───⟡\n│\n│  ⏳ ${toAccept.length} group(s)\n│     accept ho rahe hain...\n│\n╰───────────────────────⟡`,
        threadID,
        (err, d) => res(d),
        event.messageID
      )
    );
    const mid2 = info2?.messageID;
    const edit2 = (txt) => { try { api.editMessage(txt, mid2); } catch {} };

    let accepted = 0, failed = 0;
    const results = [];

    for (const item of toAccept) {
      try {
        // Try handleMessageRequest first (for PENDING/OTHER)
        try {
          await new Promise((resolve, reject) => {
            api.handleMessageRequest(item.id, true, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        } catch {}

        await new Promise(r => setTimeout(r, 1000));

        const botName = config.BOTNAME || 'SARDAR RDX BOT';
        try {
          await api.sendMessage(`✅ 𝗦𝗔𝗥𝗗𝗔𝗥 𝗥𝗗𝗫 𝗕𝗢𝗧 Successfully Connected! 🚀`, item.id);
        } catch {}
        try {
          await api.changeNickname(botName, item.id, api.getCurrentUserID());
        } catch {}

        results.push(`✅ ${item.index}. ${item.name}`);
        accepted++;
        await new Promise(r => setTimeout(r, 500));

      } catch (error) {
        results.push(`❌ ${item.index}. ${item.name}`);
        failed++;
      }
    }

    this.spamData.delete(threadID);

    edit2(
      `╭───「 🔗 𝗖𝗢𝗡𝗡𝗘𝗖𝗧 𝗥𝗘𝗦𝗨𝗟𝗧 」───⟡\n` +
      `│\n` +
      `│  ✅ Accepted : ${accepted}\n` +
      `│  ❌ Failed   : ${failed}\n` +
      `│\n│  ─────────────────────\n│\n` +
      results.map(r => `│  ${r}`).join('\n') +
      `\n│\n╰───────────────────────⟡`
    );
  }
};
