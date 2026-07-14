// Genera un par de claves VAPID (necesarias para Web Push).
// Uso:  npm run keys
// Copia la clave pública en js/notifications.js (PUSH.publicKey) y pon ambas
// como variables de entorno VAPID_PUBLIC / VAPID_PRIVATE en tu hosting.

const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();

console.log('\n=== Claves VAPID generadas ===\n');
console.log('VAPID_PUBLIC =', keys.publicKey);
console.log('VAPID_PRIVATE =', keys.privateKey);
console.log('\nGuárdalas. La pública va también en js/notifications.js (PUSH.publicKey).\n');
