// ============================================================================
//  notifications.js — Recordatorios
//
//  Estrategia por capas (de más simple/segura a más avanzada):
//   1. Recordatorio "al abrir": si es pasada tu hora y hoy aún no te has movido,
//      la app te avisa. Gratis y 100% fiable. Funciona hoy mismo.
//   2. Notificación del sistema vía service worker cuando la app está abierta o
//      en segundo plano (Notification API).
//   3. (Preparado) Web Push para avisarte a hora fija AUNQUE esté cerrada.
//      Requiere desplegar el pequeño servidor de /server. Se activa solo cuando
//      pongas la clave VAPID pública en PUSH.publicKey.
// ============================================================================

const Notifs = {
  swReg: null,

  supported() {
    return 'serviceWorker' in navigator && 'Notification' in window;
  },

  async registerSW() {
    if (!('serviceWorker' in navigator)) return null;
    try {
      this.swReg = await navigator.serviceWorker.register('sw.js');
      return this.swReg;
    } catch (e) {
      console.warn('Service worker no registrado (¿estás abriendo por http/https?).', e);
      return null;
    }
  },

  permission() {
    return ('Notification' in window) ? Notification.permission : 'unsupported';
  },

  async requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    let p = Notification.permission;
    if (p === 'default') p = await Notification.requestPermission();
    return p;
  },

  // Muestra una notificación ya (usa el service worker si está disponible)
  async notify(title, body, tag = 'cumbre') {
    if (this.permission() !== 'granted') return false;
    const opts = {
      body,
      tag,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      data: { url: './' },
    };
    try {
      const reg = this.swReg || (await navigator.serviceWorker?.ready);
      if (reg) await reg.showNotification(title, opts);
      else new Notification(title, opts);
      return true;
    } catch (e) {
      try { new Notification(title, opts); return true; } catch (_) { return false; }
    }
  },

  // Recordatorio "al abrir": se llama al arrancar y cuando la app vuelve al frente.
  async maybeRemind() {
    const s = Store.state.settings;
    if (!s.notifications) return;
    if (this.permission() !== 'granted') return;

    const now = new Date();
    const today = todayKey(now);
    if (s.lastNotifiedDay === today) return;         // ya avisado hoy

    const [h, m] = (s.reminderTime || '08:00').split(':').map(Number);
    const passedTime = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
    if (!passedTime) return;                          // aún no es la hora

    if (Store.isActiveDay(today)) {                   // ya cumpliste algo hoy
      Store.updateSettings({ lastNotifiedDay: today });
      return;
    }

    const pending = Store.todaysActions().filter(a => !Store.isDone(a.id)).length;
    const streak = Store.currentStreak();
    const name = Store.state.user.name || 'campeón';
    let body;
    if (pending > 0) {
      body = streak > 0
        ? `Llevas ${streak} días de racha. Te quedan ${pending} escalón(es) para no romperla hoy 🔥`
        : `Tienes ${pending} escalón(es) para hoy. Da el primer paso.`;
    } else {
      body = 'Abre tu cumbre y define el paso de hoy.';
    }
    const ok = await this.notify(`Hola ${name}`, body, 'daily-reminder');
    if (ok) Store.updateSettings({ lastNotifiedDay: today });
  },

  // Programa un chequeo mientras la app siga abierta (respaldo del punto 1).
  startForegroundTimer() {
    if (this._timer) clearInterval(this._timer);
    // Comprueba cada 5 min si toca recordar
    this._timer = setInterval(() => this.maybeRemind(), 5 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.maybeRemind();
    });
  },

  // ---- Web Push (preparado, se activa al desplegar el servidor) ------------
  PUSH: {
    // Pega aquí tu clave VAPID pública cuando despliegues /server.
    publicKey: '',
    // URL del endpoint que guarda la suscripción (tu servidor desplegado).
    subscribeUrl: '',
  },

  pushReady() {
    return this.PUSH.publicKey && 'PushManager' in window && this.swReg;
  },

  async subscribeToPush() {
    if (!this.pushReady()) {
      console.info('Web Push aún no configurado: falta la clave VAPID o el service worker.');
      return null;
    }
    try {
      const sub = await this.swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(this.PUSH.publicKey),
      });
      if (this.PUSH.subscribeUrl) {
        await fetch(this.PUSH.subscribeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: sub,
            reminderTime: Store.state.settings.reminderTime,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });
      }
      Store.updateSettings({ pushSubscribed: true });
      return sub;
    } catch (e) {
      console.warn('No se pudo suscribir a Web Push.', e);
      return null;
    }
  },
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
