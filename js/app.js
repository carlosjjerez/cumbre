// ============================================================================
//  app.js — Interfaz, navegación y eventos
// ============================================================================

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// --- Montaña dibujada (SVG) --------------------------------------------------
const TRAIL = [[30, 148], [70, 120], [60, 96], [100, 80], [96, 58], [140, 45], [175, 26]];
function pointOnTrail(t) {
  const seg = [];
  let total = 0;
  for (let i = 1; i < TRAIL.length; i++) {
    const d = Math.hypot(TRAIL[i][0] - TRAIL[i - 1][0], TRAIL[i][1] - TRAIL[i - 1][1]);
    seg.push(d); total += d;
  }
  const target = Math.max(0, Math.min(1, t)) * total;
  let acc = 0;
  for (let i = 1; i < TRAIL.length; i++) {
    if (acc + seg[i - 1] >= target) {
      const f = seg[i - 1] ? (target - acc) / seg[i - 1] : 0;
      return [TRAIL[i - 1][0] + (TRAIL[i][0] - TRAIL[i - 1][0]) * f,
              TRAIL[i - 1][1] + (TRAIL[i][1] - TRAIL[i - 1][1]) * f];
    }
    acc += seg[i - 1];
  }
  return TRAIL[TRAIL.length - 1];
}
function mountainSVG(percent, colorId, w = 260, h = 150) {
  const pal = paletteOf(colorId);
  const [mx, my] = pointOnTrail(percent);
  const done = percent >= 1;
  const trailPts = 'M ' + TRAIL.map(p => p.join(' ')).join(' L ');
  return `<svg viewBox="0 0 260 150" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Progreso de la montaña ${Math.round(percent * 100)}%">
    <rect x="0" y="0" width="260" height="150" fill="${pal.snow}"/>
    <polygon points="200,150 235,96 260,120 260,150" fill="${pal.base}" opacity="0.35"/>
    <polygon points="0,150 70,70 110,95 175,25 260,150" fill="${pal.base}"/>
    <polygon points="175,25 152,54 192,54" fill="#ffffff" opacity="0.9"/>
    <path d="${trailPts}" fill="none" stroke="${pal.deep}" stroke-width="2.4" stroke-dasharray="5 5" stroke-linecap="round" opacity="0.85"/>
    <line x1="175" y1="25" x2="175" y2="7" stroke="#993c1d" stroke-width="2.4"/>
    <polygon points="175,7 193,12 175,17" fill="#d85a30"/>
    <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="6.5" fill="#d85a30" stroke="#fff" stroke-width="2.6"/>
    ${done ? `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="11" fill="none" stroke="#d85a30" stroke-width="1.6" opacity="0.5"/>` : ''}
  </svg>`;
}

// --- Toast ------------------------------------------------------------------
let toastTimer;
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.className = 'toast'; t.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 2600);
}

// --- Router -----------------------------------------------------------------
function currentRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  const [name, arg] = h.split('/');
  return { name: name || 'hoy', arg };
}
function go(route) { location.hash = '#/' + route; }

// ============================================================================
//  VISTAS
// ============================================================================

function view() { return $('#view'); }

function renderHoy() {
  const name = Store.state.user.name || 'Carlos';
  const streak = Store.currentStreak();
  const longest = Store.longestStreak();
  const actions = Store.todaysActions();
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const { topic, item } = getDailyFact(dayNumber(now), Store.factTopics());
  const hour = now.getHours();
  const greeting = hour < 6 ? 'Buenas noches' : hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  const streakHint = streak === 0
    ? 'Empieza tu racha hoy'
    : Store.isActiveDay(todayKey()) ? '¡Hoy ya cuenta! Sigue así' : 'No la rompas hoy';

  const actionsHTML = actions.length ? actions.map(a => {
    const done = Store.isDone(a.id);
    const pal = paletteOf(a.color);
    return `<button class="action ${done ? 'done' : ''}" data-act="toggle-action" data-id="${a.id}">
      ${icon(done ? 'circleCheck' : 'circle', 24, 'tick')}
      <span style="flex:1;min-width:0">
        <span class="title">${esc(a.title)}</span>
        <span class="from" style="color:${pal.base}">${esc(a.mountainTitle)}</span>
      </span>
    </button>`;
  }).join('') : `<div class="card" style="text-align:center;color:var(--muted);font-size:14px">
      Aún no hay escalones para hoy. Crea una montaña y añade tu paso diario.
    </div>`;

  return `
  <div class="topbar">
    <div>
      <div class="date">${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</div>
      <h1>${greeting}, ${esc(name)}</h1>
    </div>
    <button class="iconbtn" data-act="nav" data-route="ajustes" aria-label="Ajustes">${icon('settings', 22)}</button>
  </div>

  <div class="streak">
    ${icon('flame', 40, 'flame')}
    <div style="flex:1">
      <div style="display:flex;align-items:baseline;gap:8px">
        <span class="num">${streak}</span>
        <span class="lbl">${streak === 1 ? 'día de racha' : 'días de racha'}</span>
      </div>
      <div class="hint">${streakHint}${longest > streak ? ` · récord ${longest}` : ''}</div>
    </div>
  </div>

  <div style="margin-top:12px" class="daily">
    <span class="tag">${icon(topic.icon || 'bulb', 14)} ${esc(topic.label)} · dato del día</span>
    <h3>${esc(item.t)}</h3>
    <p>${esc(item.d)}</p>
    <div class="kicker">${icon('calendar', 13)} Un aprendizaje nuevo cada día</div>
  </div>

  <div class="section-label">Escalones de hoy</div>
  <div class="stack">${actionsHTML}</div>
  `;
}

function renderMountains() {
  const list = Store.state.mountains;
  const active = list.filter(m => !m.completedAt);
  const done = list.filter(m => m.completedAt);

  if (!list.length) {
    return `
    <div class="topbar"><div><h1>Mis montañas</h1><div class="sub">Cada objetivo, una cima que conquistar</div></div></div>
    <div class="empty">
      <div class="em-ic">${icon('mountain', 30)}</div>
      <h3>Tu primera cima te espera</h3>
      <p>Crea una montaña, apunta tu porqué y divídela en escalones. La app te ayuda a subir día a día.</p>
      <button class="btn primary" data-act="nav" data-route="nueva" style="max-width:260px;margin:0 auto">${icon('plus', 20)} Crear mi primera montaña</button>
      <button class="btn ghost" data-act="load-examples" style="max-width:260px;margin:12px auto 0">Explorar con ejemplos</button>
    </div>`;
  }

  const cardOf = (m) => {
    const pct = Store.progress(m);
    const pal = paletteOf(m.color);
    const doneMs = m.milestones.filter(x => x.done).length;
    return `<button class="mtn-card" data-act="open-mountain" data-id="${m.id}">
      <div class="card">
        <div class="mtn-svg">${mountainSVG(pct, m.color, 88, 58)}</div>
        <div class="mtn-meta">
          <h3>${esc(m.title)}</h3>
          <div class="pct">${m.completedAt ? '¡Cima conquistada! 🏔️' : `${Math.round(pct * 100)}% · ${doneMs}/${m.milestones.length} escalones`}</div>
          <div class="bar"><span style="width:${Math.round(pct * 100)}%;background:${pal.base}"></span></div>
        </div>
        ${icon('chevronRight', 20, '')}
      </div>
    </button>`;
  };

  return `
  <div class="topbar"><div><h1>Mis montañas</h1><div class="sub">${active.length} en marcha${done.length ? ` · ${done.length} conquistada${done.length > 1 ? 's' : ''}` : ''}</div></div></div>
  <div class="stack">${active.map(cardOf).join('')}</div>
  ${done.length ? `<div class="section-label">Conquistadas</div><div class="stack">${done.map(cardOf).join('')}</div>` : ''}
  `;
}

function renderMountainDetail(id) {
  const m = Store.mountain(id);
  if (!m) { go('montanas'); return ''; }
  const pct = Store.progress(m);
  const pal = paletteOf(m.color);
  const doneMs = m.milestones.filter(x => x.done).length;
  const remaining = m.milestones.length - doneMs;
  const currentIdx = m.milestones.findIndex(x => !x.done);

  const typeLabel = { habit: 'Hábito diario', goal: 'Meta con hitos', task: 'Tarea' }[m.type] || 'Meta';

  const milestonesHTML = m.milestones.length ? m.milestones.map((ms, i) => {
    const cls = ms.done ? 'done' : (i === currentIdx ? 'current' : '');
    const ic = ms.done ? 'circleCheck' : (i === currentIdx ? 'location' : 'circle');
    const col = ms.done ? 'var(--teal)' : (i === currentIdx ? 'var(--coral)' : 'var(--border-strong)');
    return `<button class="milestone ${cls}" data-act="toggle-milestone" data-mid="${m.id}" data-id="${ms.id}">
      <span class="tick" style="color:${col}">${icon(ic, 22)}</span>
      <span class="title">${esc(ms.title)}</span>
    </button>`;
  }).join('') : `<div style="color:var(--muted);font-size:14px;padding:8px 2px">Esta montaña no tiene escalones todavía.</div>`;

  const actionsHTML = m.dailyActions.length ? m.dailyActions.map(a => {
    const done = Store.isDone(a.id);
    return `<button class="action ${done ? 'done' : ''}" data-act="toggle-action" data-id="${a.id}" style="margin-bottom:8px">
      ${icon(done ? 'circleCheck' : 'circle', 22, 'tick')}
      <span class="title" style="flex:1">${esc(a.title)}</span>
    </button>`;
  }).join('') : '';

  return `
  <button class="back" data-act="nav" data-route="montanas">${icon('arrowLeft', 18)} Mis montañas</button>
  <div class="topbar" style="margin-bottom:10px">
    <h1 style="font-size:22px">${esc(m.title)}</h1>
    <button class="iconbtn" data-act="edit-mountain" data-id="${m.id}" aria-label="Editar">${icon('edit', 20)}</button>
  </div>

  <div class="detail-hero">${mountainSVG(pct, m.color, 460, 200)}</div>

  <div class="progress-row">
    <span class="big">${m.completedAt ? '¡Cima conquistada! 🏔️' : `Vas por el ${Math.round(pct * 100)}%`}</span>
    <span class="small">${m.completedAt ? typeLabel : (remaining > 0 ? `faltan ${remaining} escalón${remaining > 1 ? 'es' : ''}` : 'último paso')}</span>
  </div>
  <div class="bar" style="height:9px"><span style="width:${Math.round(pct * 100)}%;background:${pal.base}"></span></div>

  ${m.why ? `<div class="why"><div class="lbl">${icon('quote', 14)} Por qué lo hago</div><p>${esc(m.why)}</p></div>` : ''}

  ${actionsHTML ? `<div class="section-label">Paso de hoy</div><div>${actionsHTML}</div>` : ''}

  <div class="section-label">Escalones a la cima</div>
  <div class="card" style="padding:4px 16px">${milestonesHTML}</div>

  <button class="btn danger" data-act="delete-mountain" data-id="${m.id}" style="margin-top:20px">${icon('trash', 18)} Eliminar montaña</button>
  `;
}

function renderProgress() {
  const streak = Store.currentStreak();
  const longest = Store.longestStreak();
  const totalDays = Store.totalActiveDays();
  const conquered = Store.conqueredMountains();

  // Mapa de calor (últimas 16 semanas)
  const weeks = 16, totalCells = weeks * 7;
  const today = todayKey();
  let start = addDays(today, -(totalCells - 1));
  const pad = (dateFromKey(start).getDay() + 6) % 7; // 0 = lunes
  let cells = '';
  for (let i = 0; i < pad; i++) cells += `<div class="cell" style="visibility:hidden"></div>`;
  let cur = start, guard = 0;
  while (guard++ < totalCells + 10) {
    const on = Store.isActiveDay(cur);
    const isToday = cur === today;
    cells += `<div class="cell ${on ? 'on' : ''} ${isToday ? 'today' : ''}" title="${cur}"></div>`;
    if (cur === today) break;
    cur = addDays(cur, 1);
  }

  const trophies = conquered.length ? conquered.map(m => {
    const pal = paletteOf(m.color);
    return `<div class="trophy-row">
      <div class="medal" style="background:${pal.base}">${icon('trophy', 22)}</div>
      <div style="flex:1"><h3>${esc(m.title)}</h3><div class="when">Conquistada el ${new Date(m.completedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
    </div>`;
  }).join('') : `<div style="color:var(--muted);font-size:14px;padding:6px 2px">Aún no has conquistado ninguna cima. La primera está más cerca de lo que crees.</div>`;

  return `
  <div class="topbar"><div><h1>Progreso</h1><div class="sub">Mira todo lo que ya has subido</div></div></div>

  <div class="stats">
    <div class="stat"><div class="n" style="color:var(--coral)">${streak}</div><div class="l">racha actual</div></div>
    <div class="stat"><div class="n">${longest}</div><div class="l">racha récord</div></div>
    <div class="stat"><div class="n">${totalDays}</div><div class="l">días activos</div></div>
  </div>

  <div class="section-label">Tu constancia</div>
  <div class="card">
    <div class="heatmap">${cells}</div>
    <div class="legend"><span>menos</span><span class="cell"></span><span class="cell on" style="opacity:.5"></span><span class="cell on"></span><span>más</span></div>
  </div>

  <div class="section-label">Cimas conquistadas</div>
  <div class="card">${trophies}</div>
  `;
}

function renderForm(editId) {
  const editing = editId ? Store.mountain(editId) : null;
  const m = editing || { title: '', why: '', type: 'goal', color: 'teal', topic: '', milestones: [], dailyActions: [] };

  const swatches = PALETTE.map(p =>
    `<button type="button" class="swatch ${m.color === p.id ? 'active' : ''}" data-act="pick-color" data-color="${p.id}" style="background:${p.base}" aria-label="${p.id}"></button>`
  ).join('');

  const types = [['goal', 'Meta con hitos'], ['habit', 'Hábito diario'], ['task', 'Tarea suelta']]
    .map(([v, l]) => `<button type="button" class="chip ${m.type === v ? 'active' : ''}" data-act="pick-type" data-type="${v}">${l}</button>`).join('');

  const rowInputs = (arr, cls, ph) => {
    const items = arr.length ? arr : [''];
    return items.map(v => `<div class="rowitem">
      <input type="text" class="${cls}" value="${esc(typeof v === 'string' ? v : v.title)}" placeholder="${ph}">
      <button type="button" class="rm" data-act="rm-row" aria-label="Quitar">${icon('x', 18)}</button>
    </div>`).join('');
  };

  return `
  <button class="back" data-act="nav" data-route="${editing ? 'montana/' + editing.id : 'montanas'}">${icon('arrowLeft', 18)} Volver</button>
  <div class="topbar" style="margin-bottom:14px"><h1>${editing ? 'Editar montaña' : 'Nueva montaña'}</h1></div>

  <form id="mtn-form">
    <div class="field">
      <label>¿Cuál es tu cima?</label>
      <input type="text" id="f-title" value="${esc(m.title)}" placeholder="Ej. Aprender inglés" maxlength="60" required>
    </div>

    <div class="field">
      <label>¿Por qué te importa? (tu combustible)</label>
      <textarea id="f-why" placeholder="Ej. Para trabajar fuera y no tener miedo a hablar" maxlength="200">${esc(m.why)}</textarea>
      <div class="hint">Lo verás cada vez que abras la montaña. Que te toque la fibra.</div>
    </div>

    <div class="field">
      <label>Tipo</label>
      <div class="chips" id="f-type">${types}</div>
    </div>

    <div class="field">
      <label>Color de la montaña</label>
      <div class="swatches" id="f-color">${swatches}</div>
    </div>

    <div class="field">
      <label>Escalones a la cima (hitos)</label>
      <div class="rowlist" id="f-milestones">${rowInputs(m.milestones, 'ms-input', 'Ej. Conversación de 5 min')}</div>
      <button type="button" class="addrow" data-act="add-row" data-target="f-milestones" data-cls="ms-input" data-ph="Nuevo escalón">${icon('plus', 16)} Añadir escalón</button>
    </div>

    <div class="field">
      <label>Paso diario (lo que harás cada día)</label>
      <div class="rowlist" id="f-actions">${rowInputs(m.dailyActions, 'act-input', 'Ej. Estudiar 20 min')}</div>
      <button type="button" class="addrow" data-act="add-row" data-target="f-actions" data-cls="act-input" data-ph="Nuevo paso diario">${icon('plus', 16)} Añadir paso diario</button>
      <div class="hint">Aparecerá en "Hoy" y alimenta tu racha.</div>
    </div>

    <button type="submit" class="btn primary" style="margin-top:8px">${icon('check', 20)} ${editing ? 'Guardar cambios' : 'Crear montaña'}</button>
  </form>
  `;
}

function renderSettings() {
  const s = Store.state.settings;
  const chosen = s.factTopics || [];
  const topicChips = TOPICS.map(t =>
    `<button type="button" class="chip ${chosen.includes(t.id) ? 'active' : ''}" data-act="toggle-topic" data-id="${t.id}">${icon(t.icon, 16)} ${esc(t.label)}</button>`
  ).join('');
  const perm = Notifs.permission();
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const iosBanner = (isIOS && !isStandalone) ? `
    <div class="card" style="background:var(--purple-soft);border:none;margin-bottom:14px">
      <div style="display:flex;gap:10px">
        ${icon('bulb', 22)}
        <div style="font-size:13.5px;color:var(--text)">
          <strong>Para recibir avisos en el iPhone:</strong> toca el botón Compartir de Safari y elige
          "Añadir a pantalla de inicio". Abre la app desde ese icono y activa las notificaciones aquí.
        </div>
      </div>
    </div>` : '';

  return `
  <button class="back" data-act="nav" data-route="hoy">${icon('arrowLeft', 18)} Volver</button>
  <div class="topbar" style="margin-bottom:14px"><h1>Ajustes</h1></div>

  <div class="field">
    <label>Tu nombre</label>
    <input type="text" id="set-name" value="${esc(Store.state.user.name)}" placeholder="Tu nombre">
  </div>

  ${iosBanner}

  <div class="card">
    <div class="setrow">
      <div class="info"><h3>Recordatorio diario</h3><p>${perm === 'denied' ? 'Permiso bloqueado en el navegador' : 'Un aviso para no romper tu racha'}</p></div>
      <label class="switch"><input type="checkbox" id="set-notif" ${s.notifications ? 'checked' : ''} ${perm === 'denied' ? 'disabled' : ''}><span class="slider"></span></label>
    </div>
    <div class="setrow">
      <div class="info"><h3>Hora del aviso</h3><p>Cuándo quieres que te recuerde</p></div>
      <input type="time" id="set-time" value="${esc(s.reminderTime)}" style="width:120px">
    </div>
  </div>
  <div class="hint" style="margin:8px 2px 0">Ahora mismo el aviso salta cuando abres la app pasada tu hora. El aviso automático con la app cerrada se activa al desplegar el servidor de push (ver README).</div>

  <div class="section-label">Dato del día</div>
  <div class="card">
    <div style="font-size:13px;color:var(--muted);margin-bottom:10px">Temas sobre los que quieres aprender algo nuevo cada día:</div>
    <div class="chips">${topicChips}</div>
    <div class="hint" style="margin-top:10px">Rotan un día cada uno. Si no eliges ninguno, te daré una píldora de motivación.</div>
  </div>

  <div class="section-label">Tus datos</div>
  <div class="card">
    <div class="setrow">
      <div class="info"><h3>Copia de seguridad</h3><p>Guarda un archivo con todo</p></div>
      <button class="btn sm" data-act="export">${icon('download', 18)} Exportar</button>
    </div>
    <div class="setrow">
      <div class="info"><h3>Restaurar copia</h3><p>Recupera desde un archivo</p></div>
      <button class="btn sm" data-act="import-click">${icon('upload', 18)} Importar</button>
      <input type="file" id="import-file" accept="application/json,.json" class="hidden">
    </div>
  </div>
  <div class="hint" style="margin:8px 2px 0">Tus datos viven solo en este dispositivo. Haz una copia de vez en cuando por seguridad.</div>

  <button class="btn danger" data-act="reset" style="margin-top:20px">Borrar todo y empezar de cero</button>
  `;
}

// --- Render principal -------------------------------------------------------
function render() {
  const r = currentRoute();
  const v = view();
  let html = '';
  switch (r.name) {
    case 'hoy': html = renderHoy(); break;
    case 'montanas': html = renderMountains(); break;
    case 'montana': html = renderMountainDetail(r.arg); break;
    case 'nueva': html = renderForm(null); break;
    case 'editar': html = renderForm(r.arg); break;
    case 'progreso': html = renderProgress(); break;
    case 'ajustes': html = renderSettings(); break;
    default: html = renderHoy();
  }
  v.innerHTML = `<div class="screen">${html}</div>`;
  v.scrollTop = 0; window.scrollTo(0, 0);

  // Barra inferior y FAB
  const showChrome = ['hoy', 'montanas', 'montana', 'progreso'].includes(r.name);
  $('#tabbar').classList.toggle('hidden', !showChrome);
  const showFab = ['hoy', 'montanas'].includes(r.name);
  $('#fab').classList.toggle('hidden', !showFab);
  $$('.tab').forEach(t => t.classList.toggle('active',
    (t.dataset.route === 'hoy' && r.name === 'hoy') ||
    (t.dataset.route === 'montanas' && (r.name === 'montanas' || r.name === 'montana')) ||
    (t.dataset.route === 'progreso' && r.name === 'progreso')));
}

// ============================================================================
//  EVENTOS
// ============================================================================
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;

  switch (act) {
    case 'nav': go(el.dataset.route); break;
    case 'open-mountain': go('montana/' + el.dataset.id); break;
    case 'edit-mountain': go('editar/' + el.dataset.id); break;

    case 'toggle-action': {
      Store.toggleAction(el.dataset.id);
      const wasStreak = el.classList.contains('done');
      render();
      if (!wasStreak && Store.isActiveDay(todayKey())) toast('¡Escalón subido! 🔥');
      break;
    }
    case 'toggle-milestone': {
      const m = Store.mountain(el.dataset.mid);
      const wasCompleted = m && m.completedAt;
      Store.toggleMilestone(el.dataset.mid, el.dataset.id);
      render();
      const now = Store.mountain(el.dataset.mid);
      if (now && now.completedAt && !wasCompleted) toast('🏔️ ¡Cima conquistada!');
      break;
    }

    case 'delete-mountain':
      showConfirm('¿Eliminar esta montaña?', 'Se borrarán sus escalones y su progreso. No se puede deshacer.', () => {
        Store.deleteMountain(el.dataset.id); go('montanas'); toast('Montaña eliminada');
      });
      break;

    case 'load-examples':
      Store.loadExamples(); render(); toast('Ejemplos cargados');
      break;

    // Formulario
    case 'pick-type':
      $$('#f-type .chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      break;
    case 'pick-color':
      $$('#f-color .swatch').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      break;
    case 'add-row': {
      const target = $('#' + el.dataset.target);
      const row = document.createElement('div');
      row.className = 'rowitem';
      row.innerHTML = `<input type="text" class="${el.dataset.cls}" placeholder="${el.dataset.ph}">
        <button type="button" class="rm" data-act="rm-row" aria-label="Quitar">${icon('x', 18)}</button>`;
      target.appendChild(row);
      row.querySelector('input').focus();
      break;
    }
    case 'rm-row':
      el.closest('.rowitem')?.remove();
      break;

    // Ajustes
    case 'toggle-topic':
      Store.toggleFactTopic(el.dataset.id);
      render();
      break;
    case 'export': doExport(); break;
    case 'import-click': $('#import-file').click(); break;
    case 'reset':
      showConfirm('¿Borrar todo?', 'Se eliminarán todas tus montañas, tu racha y tus ajustes. Exporta una copia antes si quieres conservarlo.', () => {
        Store.reset(); location.hash = '#/hoy'; showOnboarding(); toast('Todo borrado');
      });
      break;

    // Onboarding
    case 'onboard-start': finishOnboarding(false); break;
    case 'onboard-examples': finishOnboarding(true); break;
    case 'close-overlay': el.closest('.overlay')?.remove(); break;
    case 'confirm-yes': {
      const cb = window.__confirmCb; $('#overlay-confirm')?.remove(); if (cb) cb(); window.__confirmCb = null; break;
    }
  }
});

// Envío del formulario de montaña
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'mtn-form') return;
  e.preventDefault();
  const title = $('#f-title').value.trim();
  if (!title) { toast('Ponle un nombre a tu cima'); return; }
  const data = {
    title,
    why: $('#f-why').value.trim(),
    type: ($('#f-type .chip.active')?.dataset.type) || 'goal',
    color: ($('#f-color .swatch.active')?.dataset.color) || 'teal',
    milestones: $$('#f-milestones .ms-input').map(i => i.value.trim()).filter(Boolean),
    dailyActions: $$('#f-actions .act-input').map(i => i.value.trim()).filter(Boolean),
  };
  const r = currentRoute();
  if (r.name === 'editar') {
    Store.updateMountain(r.arg, data);
    go('montana/' + r.arg); toast('Cambios guardados');
  } else {
    const m = Store.createMountain(data);
    go('montana/' + m.id); toast('¡Montaña creada! A subir 🏔️');
  }
});

// Cambios en ajustes (name/time/notif/import)
document.addEventListener('change', async (e) => {
  const id = e.target.id;
  if (id === 'set-name') { Store.setUser(e.target.value.trim()); }
  else if (id === 'set-time') { Store.updateSettings({ reminderTime: e.target.value }); toast('Hora guardada'); }
  else if (id === 'set-notif') {
    if (e.target.checked) {
      const p = await Notifs.requestPermission();
      if (p === 'granted') {
        Store.updateSettings({ notifications: true });
        await Notifs.subscribeToPush();
        toast('Notificaciones activadas');
        Notifs.notify('¡Listo! 🔔', 'Te avisaré para que no rompas tu racha.');
      } else {
        e.target.checked = false;
        toast(p === 'denied' ? 'Permiso bloqueado en el navegador' : 'Permiso no concedido');
      }
    } else {
      Store.updateSettings({ notifications: false });
      toast('Notificaciones desactivadas');
    }
  }
  else if (id === 'import-file') {
    const file = e.target.files[0]; if (!file) return;
    try {
      const text = await file.text();
      Store.importJSON(text);
      go('hoy'); render(); toast('Copia restaurada');
    } catch (err) { toast('Archivo no válido'); }
  }
});

// --- Acciones auxiliares ----------------------------------------------------
function doExport() {
  const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `cumbre-copia-${todayKey()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Copia descargada');
}

function showConfirm(title, body, onYes) {
  window.__confirmCb = onYes;
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'overlay-confirm';
  ov.innerHTML = `<div class="sheet">
    <h2>${esc(title)}</h2>
    <p class="lead">${esc(body)}</p>
    <button class="btn danger" data-act="confirm-yes">Sí, continuar</button>
    <button class="btn ghost" data-act="close-overlay" style="margin-top:10px">Cancelar</button>
  </div>`;
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
}

// --- Onboarding -------------------------------------------------------------
function showOnboarding() {
  if ($('#overlay-onboard')) return;
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'overlay-onboard';
  ov.innerHTML = `<div class="sheet">
    <div class="mark">${icon('mountain', 30)}</div>
    <h2>Bienvenido a Cumbre</h2>
    <p class="lead">Cada objetivo es una montaña. Cada día que cumples, subes un escalón hacia la cima. Empecemos por tu nombre.</p>
    <div class="field"><input type="text" id="onboard-name" placeholder="¿Cómo te llamas?" autocomplete="given-name"></div>
    <button class="btn primary" data-act="onboard-start">${icon('plus', 20)} Empezar</button>
    <button class="btn ghost" data-act="onboard-examples" style="margin-top:10px">Ver primero con ejemplos</button>
  </div>`;
  document.body.appendChild(ov);
  setTimeout(() => $('#onboard-name')?.focus(), 300);
}
function finishOnboarding(withExamples) {
  const name = ($('#onboard-name')?.value || '').trim();
  Store.setUser(name);
  if (withExamples) Store.loadExamples();
  $('#overlay-onboard')?.remove();
  go('hoy'); render();
  toast(name ? `¡A por ello, ${name}!` : '¡Vamos allá!');
}

// --- Init -------------------------------------------------------------------
async function init() {
  Store.load();
  await Notifs.registerSW();
  window.addEventListener('hashchange', render);
  render();
  if (!Store.state.onboarded) showOnboarding();
  Notifs.startForegroundTimer();
  Notifs.maybeRemind();
}
init();
