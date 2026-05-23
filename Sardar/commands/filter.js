const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const spin = ['◐', '◓', '◑', '◒'];

function bar(done, total, size = 10) {
  const f = Math.round((done / Math.max(total, 1)) * size);
  return '█'.repeat(f) + '░'.repeat(size - f);
}

function pct(done, total) {
  return Math.round((done / Math.max(total, 1)) * 100);
}

function bold(t) {
  const map = { a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵' };
  return String(t).split('').map(c => map[c] || c).join('');
}

// ONLY mark as suspended when Facebook explicitly returns "Facebook User"
// This is the name Facebook assigns to deactivated/suspended/banned accounts
// If getUserInfo fails or returns null → SKIP (never remove on uncertainty)
function isSuspended(userInfo) {
  if (!userInfo) return false; // API failure = skip, do NOT remove
  const name = (userInfo.name || '').trim().toLowerCase();
  return name === 'facebook user';
}

module.exports = {
  config: {
    credits: 'SARDAR RDX',
    name: 'filter',
    aliases: ['cleansuspended', 'removesuspended', 'filtergroup'],
    description: 'Group se sirf suspended/banned accounts remove karo.',
    usage: 'filter',
    category: 'Group',
    prefix: true,
    groupOnly: true,
    adminOnly: true,
    cooldowns: 15
  },

  async run({ api, event, send, config, isAdmin }) {
    const { threadID, senderID } = event;

    if (!isAdmin) {
      return send.reply(
        `╭─── « ❌ ACCESS DENIED » ───⟡\n` +
        `│\n` +
        `│ 🚫 Yeh command sirf Bot\n` +
        `│    Admin use kar sakta hai!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    let threadInfo;
    try {
      threadInfo = await new Promise((res, rej) =>
        api.getThreadInfo(threadID, (err, info) => err ? rej(err) : res(info))
      );
    } catch (e) {
      return send.reply(
        `╭─── « ❌ ERROR » ───⟡\n` +
        `│\n` +
        `│ 😔 Group info nahi mili.\n` +
        `│ ◈ ${e.message || 'Unknown'}\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const botID = api.getCurrentUserID();

    // Safe list — these IDs will NEVER be removed no matter what
    const safeIDs = new Set([
      botID,
      ...( config.ADMINBOT || []).map(String)
    ]);

    const members = (threadInfo.participantIDs || [])
      .map(String)
      .filter(id => !safeIDs.has(id));

    if (!members.length) {
      return send.reply(
        `╭─── « ❌ KHAALI » ───⟡\n` +
        `│\n` +
        `│ 😕 Koi member nahi mila.\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const info = await send.reply(
      `╭─── « 🔍 FILTER » ───⟡\n` +
      `│\n` +
      `│ ${spin[0]} Scanning shuru...\n` +
      `│ 👥 Members: ${bold(String(members.length))}\n` +
      `│ 🛡️ Safe IDs: ${bold(String(safeIDs.size))}\n` +
      `│\n` +
      `│ [░░░░░░░░░░] 0%\n` +
      `│\n` +
      `╰───────────────⟡`
    );

    const mid = info?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    // Scan in small batches of 10 to reduce API failure risk
    const BATCH = 10;
    const suspendedIDs = [];
    const skippedIDs = [];
    let scanned = 0;
    let sf = 0;

    for (let i = 0; i < members.length; i += BATCH) {
      const chunk = members.slice(i, i + BATCH);

      let infoMap = {};
      let batchFailed = false;

      try {
        infoMap = await new Promise((res, rej) =>
          api.getUserInfo(chunk, (err, data) => err ? rej(err) : res(data || {}))
        );
      } catch {
        // If batch fails entirely — skip all IDs in this batch (never remove on uncertainty)
        batchFailed = true;
        for (const id of chunk) skippedIDs.push(id);
      }

      if (!batchFailed) {
        for (const uid of chunk) {
          const userInfo = infoMap[uid] || null;

          if (userInfo === null) {
            // getUserInfo returned nothing for this specific ID — skip safely
            skippedIDs.push(uid);
          } else if (isSuspended(userInfo)) {
            // Double-check: never remove a safe ID even if API says suspended
            if (!safeIDs.has(uid)) {
              suspendedIDs.push(uid);
            }
          }
        }
      }

      scanned += chunk.length;
      sf++;

      const p = pct(scanned, members.length);
      const b = bar(scanned, members.length);

      edit(
        `╭─── « 🔍 SCANNING » ───⟡\n` +
        `│\n` +
        `│ ${spin[sf % 4]} Check ho raha hai...\n` +
        `│ 👥 ${scanned}/${members.length} scanned\n` +
        `│\n` +
        `│ [${b}] ${p}%\n` +
        `│ 🚫 Suspended: ${suspendedIDs.length}\n` +
        `│ ⏭️ Skipped:   ${skippedIDs.length}\n` +
        `│\n` +
        `╰───────────────⟡`
      );

      await sleep(300);
    }

    if (!suspendedIDs.length) {
      await sleep(400);
      return edit(
        `╭─── « ✅ GROUP SAAF » ───⟡\n` +
        `│\n` +
        `│ 🎉 Koi suspended account\n` +
        `│    nahi mila group mein!\n` +
        `│\n` +
        `│ ◈ 👥 Scanned : ${bold(String(members.length))}\n` +
        `│ ◈ 🚫 Found   : ${bold('0')}\n` +
        `│ ◈ ⏭️ Skipped  : ${bold(String(skippedIDs.length))}\n` +
        `│\n` +
        `│ ✨ Group bilkul clean hai!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    edit(
      `╭─── « 🗑️ REMOVING » ───⟡\n` +
      `│\n` +
      `│ ${spin[0]} Suspended accounts\n` +
      `│    remove ho rahe hain...\n` +
      `│ 🚫 Found: ${bold(String(suspendedIDs.length))}\n` +
      `│\n` +
      `│ [░░░░░░░░░░] 0%\n` +
      `│\n` +
      `╰───────────────⟡`
    );

    await sleep(500);

    let removed = 0;
    let removeFailed = 0;
    sf = 0;

    for (const uid of suspendedIDs) {
      // Final safety check before every removal
      if (safeIDs.has(uid)) {
        removeFailed++;
        continue;
      }

      try {
        await new Promise((res, rej) =>
          api.removeUserFromGroup(uid, threadID, (err) => err ? rej(err) : res())
        );
        removed++;
      } catch {
        removeFailed++;
      }

      sf++;
      const p = pct(removed + removeFailed, suspendedIDs.length);
      const b = bar(removed + removeFailed, suspendedIDs.length);

      edit(
        `╭─── « 🗑️ REMOVING » ───⟡\n` +
        `│\n` +
        `│ ${spin[sf % 4]} Remove ho raha hai...\n` +
        `│ 🚫 ${removed + removeFailed}/${suspendedIDs.length}\n` +
        `│\n` +
        `│ [${b}] ${p}%\n` +
        `│ ✅ Removed: ${removed}  ❌ Failed: ${removeFailed}\n` +
        `│\n` +
        `╰───────────────⟡`
      );

      await sleep(500);
    }

    await sleep(400);

    edit(
      `╭─── « ✅ FILTER DONE » ───⟡\n` +
      `│\n` +
      `│ 🧹 ${bold('Group Filter Mukammal!')}\n` +
      `│\n` +
      `│ ◈ 👥 Scanned  : ${bold(String(members.length))}\n` +
      `│ ◈ 🚫 Found    : ${bold(String(suspendedIDs.length))}\n` +
      `│ ◈ ✅ Removed  : ${bold(String(removed))}\n` +
      `│ ◈ ❌ Failed   : ${bold(String(removeFailed))}\n` +
      `│ ◈ ⏭️ Skipped   : ${bold(String(skippedIDs.length))}\n` +
      `│\n` +
      `│ 🛡️ Bot admins protected!\n` +
      `│ ✨ Group ab clean hai!\n` +
      `│\n` +
      `╰───────────────⟡`
    );
  }
};
