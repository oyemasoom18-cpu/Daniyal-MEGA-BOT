const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs-extra');

const dbDir = path.join(__dirname, 'botdata');
fs.ensureDirSync(dbDir);

const db = {
  users: new Datastore({ filename: path.join(dbDir, 'users.db'), autoload: true }),
  threads: new Datastore({ filename: path.join(dbDir, 'threads.db'), autoload: true }),
  currencies: new Datastore({ filename: path.join(dbDir, 'currencies.db'), autoload: true }),
  bank: new Datastore({ filename: path.join(dbDir, 'bank.db'), autoload: true }),
  nicklocks: new Datastore({ filename: path.join(dbDir, 'nicklocks.db'), autoload: true })
};

// Compact DBs periodically
Object.values(db).forEach(d => {
  d.ensureIndex({ fieldName: '_id', unique: true }, () => {});
  d.ensureIndex({ fieldName: 'userId' }, () => {});
  d.ensureIndex({ fieldName: 'threadId' }, () => {});
  setInterval(() => {
    try { d.compactDatafile(); } catch {}
  }, 300000);
});

// Promisify helpers
db.findOne = (store, query) => new Promise((res, rej) => {
  store.findOne(query, (e, d) => e ? rej(e) : res(d));
});

db.findAll = (store, query = {}) => new Promise((res, rej) => {
  store.find(query, (e, d) => e ? rej(e) : res(d));
});

db.insert = (store, doc) => new Promise((res, rej) => {
  store.insert(doc, (e, d) => e ? rej(e) : res(d));
});

db.update = (store, query, update, options = {}) => new Promise((res, rej) => {
  store.update(query, update, options, (e, n) => e ? rej(e) : res(n));
});

db.remove = (store, query, options = {}) => new Promise((res, rej) => {
  store.remove(query, options, (e, n) => e ? rej(e) : res(n));
});

db.count = (store, query = {}) => new Promise((res, rej) => {
  store.count(query, (e, n) => e ? rej(e) : res(n));
});

module.exports = db;
