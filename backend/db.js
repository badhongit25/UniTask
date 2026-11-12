const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial empty DB structure
const initialData = {
  users: [],
  tasks: [],
  notifications: [],
  activities: []
};

// Initialize file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
}

// In-memory cache + lock for safety
let dbCache = null;
let isWriting = false;
const writeQueue = [];

function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    dbCache = JSON.parse(raw);
    if (!dbCache.users) dbCache.users = [];
    if (!dbCache.tasks) dbCache.tasks = [];
    if (!dbCache.notifications) dbCache.notifications = [];
    if (!dbCache.activities) dbCache.activities = [];
    return dbCache;
  } catch (err) {
    console.error('Error reading db:', err);
    if (!dbCache) {
      dbCache = JSON.parse(JSON.stringify(initialData));
    }
    return dbCache;
  }
}

async function writeDb(data) {
  dbCache = data;
  return new Promise((resolve, reject) => {
    writeQueue.push({ data, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (isWriting || writeQueue.length === 0) return;
  isWriting = true;
  const item = writeQueue.shift();

  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    await fs.promises.writeFile(tempFile, JSON.stringify(item.data, null, 2), 'utf-8');
    await fs.promises.rename(tempFile, DB_FILE);
    item.resolve(item.data);
  } catch (err) {
    console.error('Error writing DB:', err);
    item.reject(err);
  } finally {
    isWriting = false;
    if (writeQueue.length > 0) {
      processQueue();
    }
  }
}

module.exports = {
  readDb,
  writeDb
};
