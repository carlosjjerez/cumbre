// ============================================================================
//  server.js — Servidor de notificaciones push para Cumbre
//
//  Qué hace:
//   - Guarda las suscripciones push del navegador (a qué dispositivo avisar).
//   - Cada 15 min revisa quién tiene su "hora de aviso" y le manda un push,
//     aunque tenga la app cerrada.
//
//  Almacén: un simple archivo subscriptions.json (sin base de datos).
//  Despliegue: cualquier hosting de Node (Render, Railway, Fly.io...). Ver README.
//
//  Variables de entorno necesarias:
//   VAPID_PUBLIC, VAPID_PRIVATE  -> genéralas con: npm run keys
//   VAPID_SUBJECT (opcional)     -> "mailto:tucorreo@ejemplo.com"
//   PORT (opcional)              -> por defecto 3000
// ============================================================================

const express = require('express');
const webpush = require('web-push');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'subscriptions.json');

const VAPID_PUBLIC = process.env.VAPID_PUBLIC || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hola@cumbre.app';

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.error('Faltan las claves VAPID. Ejecuta "npm run keys" y ponlas como variables de entorno.');
  process.exit(1);
}
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

// --- Almacén simple ---------------------------------------------------------
function loadSubs() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (_) { return []; }
}
function saveSubs(subs) {
  fs.writeFileSync(DB_FILE, JSON.stringify(subs, null, 2));
}

// --- API --------------------------------------------------------------------
const app = express();
app.use(express.json());

// CORS abierto (la app es estática y puede estar en otro dominio)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/', (_req, res) => res.send('Cumbre push server ✅'));
app.get('/api/vapidPublicKey', (_req, res) => res.json({ key: VAPID_PUBLIC }));

app.post('/api/subscribe', (req, res) => {
  const { subscription, reminderTime, tz } = req.body || {};
  if (!subscription || !subscription.endpoint) return res.status(400).json({ error: 'subscription requerida' });
  const subs = loadSubs();
  const idx = subs.findIndex(s => s.subscription.endpoint === subscription.endpoint);
  const record = {
    subscription,
    reminderTime: reminderTime || '08:00',
    tz: tz || 'Europe/Madrid',
    lastSent: '',
  };
  if (idx >= 0) subs[idx] = { ...subs[idx], ...record };
  else subs.push(record);
  saveSubs(subs);
  res.json({ ok: true });
});

app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body || {};
  let subs = loadSubs();
  subs = subs.filter(s => s.subscription.endpoint !== endpoint);
  saveSubs(subs);
  res.json({ ok: true });
});

// --- Envío diario -----------------------------------------------------------
function localParts(tz) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('es-ES', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]));
  return { hhmm: `${parts.hour}:${parts.minute}`, day: `${parts.year}-${parts.month}-${parts.day}` };
}

const MESSAGES = [
  'No rompas tu racha hoy 🔥',
  'Un escalón más hacia tu cima. ¿Cuál toca hoy?',
  'Tu yo del futuro te lo agradecerá. Da el paso de hoy.',
  'Poco a poco se sube la montaña. ¿Empezamos?',
  'Recuerda tu porqué. Hoy toca subir un escalón.',
];

async function runReminders() {
  const subs = loadSubs();
  let changed = false;
  for (const s of subs) {
    const { hhmm, day } = localParts(s.tz);
    // Ventana de 15 min: coincide la hora y aún no se envió hoy
    const [rh, rm] = s.reminderTime.split(':').map(Number);
    const [nh, nm] = hhmm.split(':').map(Number);
    const withinWindow = nh === rh && nm >= rm && nm < rm + 15;
    if (!withinWindow || s.lastSent === day) continue;

    const body = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    try {
      await webpush.sendNotification(s.subscription, JSON.stringify({
        title: 'Cumbre', body, tag: 'daily-reminder', url: './',
      }));
      s.lastSent = day; changed = true;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        s._dead = true; changed = true; // suscripción caducada
      } else {
        console.warn('Fallo enviando push:', err.statusCode || err.message);
      }
    }
  }
  if (changed) saveSubs(subs.filter(s => !s._dead));
}

// Cada 15 minutos
cron.schedule('*/15 * * * *', () => runReminders().catch(console.error));

app.listen(PORT, () => console.log(`Cumbre push server escuchando en :${PORT}`));
