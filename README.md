# 🏔️ Cumbre

Tu app personal de objetivos. Cada objetivo es una **montaña**; cada día que cumples, subes un **escalón** hacia la cima. Pensada para motivarte con tres motores: **no romper la racha**, **ver el progreso subir** y **recordar tu porqué**.

Es una **PWA** (aplicación web instalable): funciona en el iPhone como una app normal, sin App Store, sin Mac y sin coste. Tus datos se guardan **solo en tu dispositivo**.

---

## 📁 Qué hay aquí

```
app objetivos/
├── index.html              La app
├── manifest.webmanifest    Datos de la PWA (nombre, iconos…)
├── sw.js                   Service worker (offline + push)
├── css/styles.css          Estilos (modo claro y oscuro)
├── js/
│   ├── data.js             Iconos, colores y los "datos del día"
│   ├── store.js            Estado y guardado en el móvil
│   ├── notifications.js    Recordatorios
│   └── app.js              Interfaz y navegación
├── icons/                  Iconos de la app
└── server/                 (Opcional) servidor para avisos con la app cerrada
```

---

## ▶️ Probarla en el ordenador

La app necesita servirse por `http://` (no vale abrir el archivo directamente, por el service worker). Desde esta carpeta:

**Con Python:**
```bash
python -m http.server 8123
```

**Con Node:**
```bash
npx serve -l 8123 .
```

Abre <http://127.0.0.1:8123> en el navegador.

---

## 📲 Instalarla en el iPhone

1. Publica la app en internet (ver "Publicar gratis" abajo) para tener una URL `https://`.
2. Abre esa URL en **Safari** en tu iPhone.
3. Toca el botón **Compartir** → **Añadir a pantalla de inicio**.
4. Ábrela desde el nuevo icono: se ve a pantalla completa, como una app.

> Las notificaciones en iPhone **solo** funcionan si abres la app desde ese icono de la pantalla de inicio (no desde Safari).

---

## 🌐 Publicar gratis

Cualquiera de estas opciones sirve (todas tienen plan gratuito):

- **Netlify Drop** — <https://app.netlify.com/drop> → arrastra esta carpeta y listo.
- **Vercel** — `npx vercel` en esta carpeta.
- **GitHub Pages** — sube la carpeta a un repo y actívalo en Settings → Pages.
- **Cloudflare Pages** — conecta el repo o sube la carpeta.

Te dará una URL `https://…` que puedes abrir e instalar en el iPhone.

---

## 🔔 Notificaciones

Hay dos niveles:

### 1. Recordatorio "al abrir" — ya funciona, sin hacer nada
Si activas las notificaciones en **Ajustes** y pones una hora, la app te avisa
cuando la abres pasada esa hora y aún no has cumplido nada ese día. Gratis y fiable.

### 2. Aviso automático con la app cerrada — requiere desplegar `server/`
Para que el iPhone te avise a una hora fija **aunque la app esté cerrada**, hace
falta un pequeño servidor de push (es como iOS obliga a hacerlo). Pasos:

1. Entra en `server/` e instala dependencias:
   ```bash
   cd server
   npm install
   ```
2. Genera las claves VAPID:
   ```bash
   npm run keys
   ```
   Apunta `VAPID_PUBLIC` y `VAPID_PRIVATE`.
3. Despliega `server/` en un hosting de Node gratuito (Render, Railway, Fly.io…),
   poniendo `VAPID_PUBLIC`, `VAPID_PRIVATE` y `VAPID_SUBJECT` como variables de entorno.
4. En `js/notifications.js`, dentro de `PUSH`, pon:
   - `publicKey`: tu `VAPID_PUBLIC`.
   - `subscribeUrl`: `https://TU-SERVIDOR/api/subscribe`.
5. Vuelve a publicar la app, ábrela desde el icono del iPhone y activa las notificaciones.

A partir de ahí, el servidor te mandará el aviso cada día a tu hora.

---

## 💾 Tus datos

- Se guardan en el **almacenamiento local** de tu navegador/dispositivo. No salen de ahí.
- En **Ajustes** puedes **Exportar** una copia (un archivo `.json`) y **Restaurarla** cuando quieras o en otro dispositivo.
- Haz una copia de vez en cuando: si borras los datos de Safari o desinstalas, se pierden.

---

## 🧭 Ideas para más adelante

- Sincronización en la nube (para usarla en móvil y ordenador con los mismos datos).
- Más colecciones de "datos del día" y temas personalizados.
- Reflexión diaria y notas por montaña.
- Widgets y gráficas de evolución.

Hecho con cariño para seguir subiendo, un escalón cada día. 🏔️
