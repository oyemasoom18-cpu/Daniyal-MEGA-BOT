async function fetchAllGroups(api) {
  const groups = [];
  let timestamp = null;
  const BATCH = 100;
  while (true) {
    let batch;
    try {
      batch = await new Promise((res, rej) =>
        api.getThreadList(BATCH, timestamp, ['INBOX'], (err, d) => err ? rej(err) : res(d))
      );
    } catch { break; }
    if (!batch || !batch.length) break;
    groups.push(...batch.filter(t => t.isGroup));
    if (batch.length < BATCH) break;
    timestamp = parseInt(batch[batch.length - 1].timestamp);
  }
  return groups;
}

function parseNumbers(input) {
  return input
    .split(/[\s,،]+/)
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n) && n > 0);
}

module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'join',
    aliases: ['joingroup', 'groupjoin'],
    description: 'Groups ki list dekho aur kisi bhi group mein join request karo.',
    usage: 'join',
    category: 'Utility',
    prefix: true,
    adminOnly: false,
    cooldowns: 5
  },

  async run({ api, event, send, client }) {
    const { threadID, senderID, messageID } = event;

    api.setMessageReaction('⏳', messageID, () => {}, true);

    let groups = [];
    try {
      groups = await fetchAllGroups(api);
    } catch (e) {
      api.setMessageReaction('❌', messageID, () => {}, true);
      return send.reply(`❌ Groups fetch nahi ho sake!\n${e.message}`);
    }

    if (!groups.length) {
      api.setMessageReaction('❌', messageID, () => {}, true);
      return send.reply(`❌ Bot kisi group mein nahi hai!`);
    }

    const CHUNK = 25;
    const firstChunk = groups.slice(0, CHUNK);
    const remaining = groups.slice(CHUNK);

    let listMsg = `╭──── « 📋 BOT GROUPS LIST » ────⟡\n`;
    listMsg += `│ Total: ${groups.length} groups\n`;
    listMsg += `│\n`;
    listMsg += `│ Number type karo join karne ke liye\n`;
    listMsg += `│ Example: 1  ya  1,3,5  ya  2 4 6\n`;
    listMsg += `│\n`;
    listMsg += `╰────────────────────────────────⟡\n\n`;

    firstChunk.forEach((g, i) => {
      const approval = g.approvalMode ? ' 🔐' : '';
      const members = g.participantIDs?.length || '?';
      listMsg += `${i + 1}. ${g.threadName || 'Unnamed Group'}${approval}\n`;
      listMsg += `    👥 ${members} members\n\n`;
    });

    if (remaining.length > 0) {
      listMsg += `...aur ${remaining.length} aur groups hain\n\n`;
    }

    listMsg += `🔐 = Approval required group`;

    const info = await send.reply(listMsg);

    api.setMessageReaction('✅', messageID, () => {}, true);

    if (info?.messageID && client.replies) {
      client.replies.set(info.messageID, {
        commandName: 'join',
        author: senderID,
        data: { groups, senderID }
      });
      setTimeout(() => client.replies?.delete(info.messageID), 5 * 60 * 1000);
    }
  },

  async handleReply({ api, event, send, client, data }) {
    const { threadID, senderID, body, messageID } = event;
    const { groups } = data;

    const numbers = parseNumbers(body);

    if (!numbers.length) {
      return send.reply(
        `❌ Sahi number likho!\n\nExample:\n1\n1,3,5\n2 4 6`
      );
    }

    const invalid = numbers.filter(n => n > groups.length);
    if (invalid.length) {
      return send.reply(
        `❌ Yeh numbers galat hain: ${invalid.join(', ')}\nSirf 1 se ${groups.length} tak dalo.`
      );
    }

    const selected = numbers.map(n => groups[n - 1]);

    api.setMessageReaction('⏳', messageID, () => {}, true);

    const results = { success: [], approval: [], failed: [] };

    for (const group of selected) {
      const { threadID: gThreadID, threadName, approvalMode } = group;
      const gName = threadName || 'Unnamed Group';

      if (approvalMode) {
        try {
          await new Promise((resolve, reject) =>
            api.addUserToGroup(senderID, gThreadID, (err) => {
              if (err) reject(err);
              else resolve();
            })
          );
        } catch (e) {
          const rawErr = e?.error || e?.message || JSON.stringify(e) || '';
          const errMsg = String(rawErr).toLowerCase();
          if (errMsg.includes('friend')) {
            results.failed.push({ name: gName, reason: 'User bot ka friend nahi' });
            await new Promise(r => setTimeout(r, 700));
            continue;
          } else if (errMsg.includes('already') || errMsg.includes('member')) {
            results.success.push({ name: gName });
            await new Promise(r => setTimeout(r, 700));
            continue;
          }
        }
        try {
          await api.sendMessage(
            `╭──── 🔐 JOIN REQUEST ────⟡\n` +
            `│\n` +
            `│ 👤 Koi user join karna\n` +
            `│    chahta hai!\n` +
            `│\n` +
            `│ 🆔 UID: ${senderID}\n` +
            `│\n` +
            `│ 👑 Admins please approve\n` +
            `│    karen agar theek lagay!\n` +
            `│\n` +
            `╰───────────────────────⟡`,
            gThreadID
          );
          results.approval.push({ name: gName, uid: senderID });
        } catch {
          results.failed.push({ name: gName, reason: 'Request bhejne mein error' });
        }
      } else {
        try {
          await new Promise((resolve, reject) =>
            api.addUserToGroup(senderID, gThreadID, (err) => err ? reject(err) : resolve())
          );
          results.success.push({ name: gName });
        } catch (e) {
          const rawErr = e?.error || e?.message || JSON.stringify(e) || '';
          const errMsg = String(rawErr).toLowerCase();
          let reason = `Error: ${String(rawErr).slice(0, 60)}`;
          if (errMsg.includes('friend')) reason = 'User bot ka friend nahi';
          else if (errMsg.includes('already') || errMsg.includes('member')) reason = 'User pehle se member hai';
          else if (errMsg.includes('admin') || errMsg.includes('permission')) reason = 'Bot ko group admin hona chahiye';
          else if (errMsg.includes('block') || errMsg.includes('restricted')) reason = 'User ya group restricted hai';
          else if (errMsg.includes('limit')) reason = 'Group member limit full hai';
          results.failed.push({ name: gName, reason });
        }
      }

      await new Promise(r => setTimeout(r, 700));
    }

    let reply = `╭──── « ✅ JOIN RESULT » ────⟡\n│\n`;
    reply += `│ 📊 Total  : ${selected.length}\n`;
    reply += `│ ✅ Added  : ${results.success.length}\n`;
    reply += `│ 🔐 Approval: ${results.approval.length}\n`;
    reply += `│ ❌ Failed : ${results.failed.length}\n│\n`;

    if (results.success.length) {
      reply += `│ ✅ Successfully Added:\n`;
      results.success.forEach((g, i) => {
        reply += `│  ${i + 1}. ${g.name}\n`;
      });
      reply += `│\n`;
    }

    if (results.approval.length) {
      reply += `│ 🔐 Approval Request Bheja:\n`;
      results.approval.forEach((g, i) => {
        reply += `│  ${i + 1}. ${g.name}\n`;
        reply += `│     ⏳ Admin se approve hoga\n`;
      });
      reply += `│\n`;
    }

    if (results.failed.length) {
      reply += `│ ❌ Failed:\n`;
      results.failed.forEach((g, i) => {
        reply += `│  ${i + 1}. ${g.name}\n`;
        reply += `│     ⚠️ ${g.reason}\n`;
      });
      reply += `│\n`;
    }

    reply += `╰──────────────────────────⟡`;

    api.setMessageReaction(results.success.length > 0 || results.approval.length > 0 ? '✅' : '❌', messageID, () => {}, true);
    send.reply(reply);
  }
};
