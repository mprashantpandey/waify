import 'dotenv/config';
import http from 'node:http';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import QRCode from 'qrcode';
import P from 'pino';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';

const port = Number(process.env.BAILEYS_BRIDGE_PORT || 3215);
const baseUrl = (process.env.ZYPTOS_BASE_URL || 'https://zyptos.com').replace(/\/$/, '');
const secret = process.env.BAILEYS_BRIDGE_SECRET || '';
const sessionRoot = process.env.BAILEYS_SESSION_PATH || path.resolve(process.cwd(), 'storage', 'baileys-sessions');
const logger = P({ level: process.env.BAILEYS_LOG_LEVEL || 'warn' });

if (!secret) {
  console.error('BAILEYS_BRIDGE_SECRET is required.');
  process.exit(1);
}

const sessions = new Map();
const lidPhoneMap = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function authorize(req, res) {
  if (req.headers['x-baileys-bridge-secret'] !== secret) {
    json(res, 403, { ok: false, message: 'Forbidden' });
    return false;
  }
  return true;
}

async function zyptos(pathname, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Baileys-Bridge-Secret': secret,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text.slice(0, 200) };
  }
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  return data;
}

function jidFromPhone(phone) {
  const digits = String(phone || '').replace(/\D+/g, '');
  if (!digits) throw new Error('Recipient phone is required.');
  return `${digits}@s.whatsapp.net`;
}

function isLidJid(jid) {
  return String(jid || '').includes('@lid');
}

function normalizePhoneFromJid(jid) {
  const value = String(jid || '');
  if (!value || isLidJid(value)) return '';

  return value.split('@')[0].replace(/\D+/g, '');
}

function mapLidToPhone(lid, jid) {
  const lidValue = String(lid || '');
  const phone = normalizePhoneFromJid(jid);
  if (lidValue && phone) {
    lidPhoneMap.set(lidValue, phone);
  }
}

function rememberContactMapping(contact) {
  if (!contact) return;

  const possibleLids = [contact.lid, contact.id].filter((value) => isLidJid(value));
  const possibleJids = [contact.jid, contact.id].filter((value) => normalizePhoneFromJid(value));
  for (const lid of possibleLids) {
    for (const jid of possibleJids) {
      mapLidToPhone(lid, jid);
    }
  }
}

function resolveSenderPhone(item) {
  const remoteJid = item?.key?.remoteJid || '';
  const participant = item?.key?.participant || '';
  const directPhone = normalizePhoneFromJid(remoteJid) || normalizePhoneFromJid(participant);

  if (directPhone) return directPhone;

  return lidPhoneMap.get(remoteJid) || lidPhoneMap.get(participant) || '';
}

function extractText(message) {
  return message?.conversation
    || message?.extendedTextMessage?.text
    || message?.imageMessage?.caption
    || message?.videoMessage?.caption
    || message?.documentMessage?.caption
    || '';
}

function messageType(message) {
  if (message?.conversation || message?.extendedTextMessage) return 'text';
  if (message?.imageMessage) return 'image';
  if (message?.videoMessage) return 'video';
  if (message?.documentMessage) return 'document';
  if (message?.audioMessage) return 'audio';
  if (message?.stickerMessage) return 'sticker';
  if (message?.locationMessage) return 'location';
  return 'unknown';
}

async function notifyStatus(connectionId, status, extra = {}) {
  try {
    await zyptos(`/api/baileys-bridge/connections/${connectionId}/status`, { status, ...extra });
  } catch (error) {
    logger.warn({ connectionId, error: error.message }, 'Unable to notify Zyptos status');
  }
}

async function stopSession(connectionId, clearAuth = false, logout = true) {
  const key = String(connectionId);
  const existing = sessions.get(key);
  if (existing?.socket) {
    if (logout) {
      await existing.socket.logout().catch(() => undefined);
    }
    existing.socket.end?.();
  }
  sessions.delete(key);

  if (clearAuth) {
    await rm(path.join(sessionRoot, `connection-${key}`), {
      recursive: true,
      force: true,
    });
  }
}

async function startSession(connectionId, options = {}) {
  const key = String(connectionId);
  if (options.forceRestart) {
    await stopSession(key, true, false);
  }

  const existing = sessions.get(key);
  if (existing?.socket) return existing;

  await mkdir(sessionRoot, { recursive: true });
  const authPath = path.join(sessionRoot, `connection-${key}`);
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  const { version } = await fetchLatestBaileysVersion();
  const stateRef = {
    connectionId: key,
    status: 'starting',
    qr: null,
    phone: null,
    error: null,
    lastSendAt: 0,
    socket: null,
  };

  const socket = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['Zyptos QR', 'Chrome', '1.0.0'],
    logger,
    markOnlineOnConnect: false,
    syncFullHistory: false,
    shouldIgnoreJid: (jid) => {
      const value = String(jid || '');
      return value.endsWith('@g.us') || value.includes('@broadcast') || value.includes('@newsletter');
    },
  });

  stateRef.socket = socket;
  sessions.set(key, stateRef);

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('chats.phoneNumberShare', ({ lid, jid }) => {
    mapLidToPhone(lid, jid);
    logger.info({ connectionId: key, lid, jid }, 'Stored Baileys LID phone mapping');
  });

  socket.ev.on('contacts.upsert', (contacts = []) => {
    for (const contact of contacts) rememberContactMapping(contact);
  });

  socket.ev.on('contacts.update', (contacts = []) => {
    for (const contact of contacts) rememberContactMapping(contact);
  });

  socket.ev.on('connection.update', async (update) => {
    if (update.qr) {
      stateRef.qr = await QRCode.toDataURL(update.qr, { margin: 1, width: 260 });
      stateRef.status = 'qr_pending';
      stateRef.error = null;
      await notifyStatus(key, 'qr_pending');
    }

    if (update.connection === 'open') {
      const phone = socket.user?.id?.split(':')[0]?.replace(/\D+/g, '') || '';
      stateRef.status = 'connected';
      stateRef.qr = null;
      stateRef.phone = phone;
      stateRef.error = null;
      await notifyStatus(key, 'connected', { phone });
    }

    if (update.connection === 'close') {
      const code = update.lastDisconnect?.error?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      stateRef.status = loggedOut ? 'logged_out' : 'disconnected';
      stateRef.error = update.lastDisconnect?.error?.message || null;
      stateRef.socket = null;
      sessions.delete(key);
      await notifyStatus(key, stateRef.status, { error: stateRef.error });
      if (!loggedOut) {
        setTimeout(() => startSession(key).catch((error) => logger.error({ error: error.message }, 'Baileys reconnect failed')), 5000);
      }
    }
  });

  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const item of messages || []) {
      const remoteJid = item?.key?.remoteJid || '';
      if (item?.key?.fromMe || remoteJid.endsWith('@g.us') || remoteJid.includes('@broadcast') || remoteJid.includes('@newsletter')) {
        continue;
      }
      const phone = resolveSenderPhone(item);
      if (!phone || !item.message) {
        if (isLidJid(remoteJid)) {
          logger.warn({ connectionId: key, remoteJid, messageId: item?.key?.id }, 'Skipped inbound Baileys message with unresolved LID sender');
        }
        continue;
      }

      try {
        await zyptos(`/api/baileys-bridge/connections/${key}/message`, {
          message_id: item.key?.id || `${Date.now()}-${phone}`,
          from: phone,
          name: item.pushName || phone,
          type: messageType(item.message),
          text: extractText(item.message),
          timestamp: Number(item.messageTimestamp || Math.floor(Date.now() / 1000)),
          payload: {
            message: item.message,
            baileys_key: item.key,
            remote_jid: remoteJid,
          },
        });
      } catch (error) {
        logger.warn({ connectionId: key, error: error.message }, 'Unable to push inbound Baileys message');
      }
    }
  });

  return stateRef;
}

async function sendText(connectionId, to, text) {
  const session = await startSession(connectionId);
  if (session.status !== 'connected' || !session.socket) {
    throw new Error('QR session is not connected.');
  }

  const now = Date.now();
  const delay = 2500 - (now - session.lastSendAt);
  if (delay > 0) await sleep(delay);

  const result = await session.socket.sendMessage(jidFromPhone(to), { text: String(text || '').slice(0, 4000) });
  session.lastSendAt = Date.now();

  return result?.key?.id || `baileys-${Date.now()}`;
}

async function sendMedia(connectionId, to, type, url, caption = '', filename = '') {
  const session = await startSession(connectionId);
  if (session.status !== 'connected' || !session.socket) {
    throw new Error('QR session is not connected.');
  }

  const normalizedType = String(type || '').toLowerCase();
  if (!['image', 'video', 'document', 'audio'].includes(normalizedType)) {
    throw new Error(`Unsupported QR media type: ${normalizedType}`);
  }

  const now = Date.now();
  const delay = 2500 - (now - session.lastSendAt);
  if (delay > 0) await sleep(delay);

  const payload = normalizedType === 'audio'
    ? { audio: { url }, mimetype: 'audio/mpeg' }
    : {
        [normalizedType]: { url },
        ...(caption ? { caption: String(caption).slice(0, 1000) } : {}),
        ...(normalizedType === 'document' && filename ? { fileName: filename } : {}),
      };

  const result = await session.socket.sendMessage(jidFromPhone(to), payload);
  session.lastSendAt = Date.now();

  return result?.key?.id || `baileys-${Date.now()}`;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!authorize(req, res)) return;

    const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
    const parts = url.pathname.split('/').filter(Boolean);

    if (req.method === 'POST' && url.pathname === '/sessions') {
      const body = await readJson(req);
      const connectionId = body.connection_id;
      if (!connectionId) return json(res, 422, { ok: false, message: 'connection_id is required' });
      const session = await startSession(connectionId, { forceRestart: Boolean(body.force_restart) });
      return json(res, 200, {
        ok: true,
        status: session.status,
        qr: session.qr,
        phone: session.phone,
        error: session.error,
      });
    }

    if (parts[0] === 'sessions' && parts[1]) {
      const connectionId = parts[1];
      if (req.method === 'GET' && parts.length === 2) {
        const session = sessions.get(String(connectionId)) || await startSession(connectionId);
        return json(res, 200, {
          ok: true,
          status: session.status,
          qr: session.qr,
          phone: session.phone,
          error: session.error,
        });
      }

      if (req.method === 'DELETE' && parts.length === 2) {
        await stopSession(connectionId, true, true);
        return json(res, 200, { ok: true, status: 'disconnected' });
      }

      if (req.method === 'POST' && parts[2] === 'send-text') {
        const body = await readJson(req);
        const messageId = await sendText(connectionId, body.to, body.text);
        return json(res, 200, { ok: true, message_id: messageId });
      }

      if (req.method === 'POST' && parts[2] === 'send-media') {
        const body = await readJson(req);
        const messageId = await sendMedia(connectionId, body.to, body.type, body.url, body.caption, body.filename);
        return json(res, 200, { ok: true, message_id: messageId });
      }
    }

    json(res, 404, { ok: false, message: 'Not found' });
  } catch (error) {
    logger.error({ error: error.message }, 'Baileys bridge request failed');
    json(res, 500, { ok: false, message: error.message });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Zyptos Baileys bridge listening on 127.0.0.1:${port}`);
});
