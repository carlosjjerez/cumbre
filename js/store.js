// ============================================================================
//  store.js — Estado de la app y persistencia en el móvil (localStorage)
//  Aquí vive todo: tus montañas, lo que cumples cada día, tu racha y ajustes.
//  Nada sale de tu dispositivo.
// ============================================================================

const STORAGE_KEY = 'cumbre.v1';
const SCHEMA = 1;

// --- Utilidades de fecha ----------------------------------------------------
function todayKey(d = new Date()) {
  // Clave local YYYY-MM-DD (sin desfase de zona horaria)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function dateFromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function addDays(key, n) {
  const d = dateFromKey(key);
  d.setDate(d.getDate() + n);
  return todayKey(d);
}
function dayNumber(d = new Date()) {
  // Días absolutos desde época local, para rotar el "dato del día"
  return Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate())).getTime() / 86400000);
}
function uid() {
  return 'm' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

// --- Estado por defecto -----------------------------------------------------
function defaultState() {
  return {
    schema: SCHEMA,
    user: { name: '', createdAt: todayKey() },
    onboarded: false,
    mountains: [],       // ver shape en createMountain()
    log: {},             // { 'YYYY-MM-DD': { done: [actionId], reflection: '' } }
    settings: {
      notifications: false,
      reminderTime: '08:00',
      lastNotifiedDay: '',
      pushSubscribed: false,
    },
  };
}

// --- Store ------------------------------------------------------------------
const Store = {
  state: defaultState(),

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = Object.assign(defaultState(), parsed);
        this.state.settings = Object.assign(defaultState().settings, parsed.settings || {});
      }
    } catch (e) {
      console.warn('No se pudo leer el almacenamiento, empezando limpio.', e);
      this.state = defaultState();
    }
    return this.state;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('No se pudo guardar en el móvil.', e);
    }
  },

  // --- Montañas -------------------------------------------------------------
  createMountain(data) {
    const m = {
      id: uid(),
      title: data.title || 'Nueva montaña',
      why: data.why || '',
      type: data.type || 'goal',         // 'habit' | 'goal' | 'task'
      color: data.color || 'teal',
      topic: data.topic || '',           // tema para el dato del día
      createdAt: todayKey(),
      completedAt: null,
      milestones: (data.milestones || []).map(t => ({ id: uid(), title: t, done: false, doneAt: null })),
      dailyActions: (data.dailyActions || []).map(t => ({ id: uid(), title: t })),
    };
    this.state.mountains.push(m);
    this.save();
    return m;
  },

  updateMountain(id, data) {
    const m = this.mountain(id);
    if (!m) return;
    if (data.title !== undefined) m.title = data.title;
    if (data.why !== undefined) m.why = data.why;
    if (data.type !== undefined) m.type = data.type;
    if (data.color !== undefined) m.color = data.color;
    if (data.topic !== undefined) m.topic = data.topic;
    if (data.milestones) {
      // Conserva el estado 'done' de los hitos que sigan existiendo por título
      const prev = m.milestones;
      m.milestones = data.milestones.map(t => {
        const found = prev.find(p => p.title === t);
        return found || { id: uid(), title: t, done: false, doneAt: null };
      });
    }
    if (data.dailyActions) {
      const prev = m.dailyActions;
      m.dailyActions = data.dailyActions.map(t => {
        const found = prev.find(p => p.title === t);
        return found || { id: uid(), title: t };
      });
    }
    this.save();
    return m;
  },

  deleteMountain(id) {
    this.state.mountains = this.state.mountains.filter(m => m.id !== id);
    this.save();
  },

  mountain(id) {
    return this.state.mountains.find(m => m.id === id);
  },

  // Porcentaje de subida = hitos completados / total
  progress(m) {
    if (!m.milestones.length) return m.completedAt ? 1 : 0;
    const done = m.milestones.filter(x => x.done).length;
    return done / m.milestones.length;
  },

  toggleMilestone(mountainId, milestoneId) {
    const m = this.mountain(mountainId);
    if (!m) return;
    const ms = m.milestones.find(x => x.id === milestoneId);
    if (!ms) return;
    ms.done = !ms.done;
    ms.doneAt = ms.done ? todayKey() : null;
    // ¿Montaña conquistada?
    const all = m.milestones.length && m.milestones.every(x => x.done);
    m.completedAt = all ? (m.completedAt || todayKey()) : null;
    this.save();
  },

  // --- Acciones diarias / registro del día ----------------------------------
  todaysActions() {
    // Todas las acciones diarias de montañas no conquistadas
    const out = [];
    for (const m of this.state.mountains) {
      if (m.completedAt) continue;
      for (const a of m.dailyActions) {
        out.push({ ...a, mountainId: m.id, mountainTitle: m.title, color: m.color });
      }
    }
    return out;
  },

  dayLog(key = todayKey()) {
    if (!this.state.log[key]) this.state.log[key] = { done: [], reflection: '' };
    return this.state.log[key];
  },

  isDone(actionId, key = todayKey()) {
    return this.dayLog(key).done.includes(actionId);
  },

  toggleAction(actionId, key = todayKey()) {
    const log = this.dayLog(key);
    const i = log.done.indexOf(actionId);
    if (i >= 0) log.done.splice(i, 1);
    else log.done.push(actionId);
    this.save();
  },

  setReflection(text, key = todayKey()) {
    this.dayLog(key).reflection = text;
    this.save();
  },

  // Un día "cuenta" para la racha si se completó al menos una acción
  isActiveDay(key) {
    const log = this.state.log[key];
    return !!(log && log.done && log.done.length > 0);
  },

  // Racha actual: días consecutivos activos terminando hoy (o ayer si hoy aún vacío)
  currentStreak() {
    let start = todayKey();
    if (!this.isActiveDay(start)) start = addDays(start, -1);
    let streak = 0;
    let cur = start;
    while (this.isActiveDay(cur)) {
      streak++;
      cur = addDays(cur, -1);
    }
    return streak;
  },

  longestStreak() {
    const keys = Object.keys(this.state.log).filter(k => this.isActiveDay(k)).sort();
    let best = 0, run = 0, prev = null;
    for (const k of keys) {
      if (prev && addDays(prev, 1) === k) run++;
      else run = 1;
      best = Math.max(best, run);
      prev = k;
    }
    return best;
  },

  totalActiveDays() {
    return Object.keys(this.state.log).filter(k => this.isActiveDay(k)).length;
  },

  conqueredMountains() {
    return this.state.mountains.filter(m => m.completedAt);
  },

  activeTopics() {
    const set = [];
    for (const m of this.state.mountains) {
      if (m.completedAt) continue;
      if (m.topic && !set.includes(m.topic)) set.push(m.topic);
    }
    return set.length ? set : ['motivacion'];
  },

  // --- Ajustes --------------------------------------------------------------
  updateSettings(patch) {
    Object.assign(this.state.settings, patch);
    this.save();
  },

  setUser(name) {
    this.state.user.name = name;
    this.state.onboarded = true;
    this.save();
  },

  // --- Copia de seguridad ---------------------------------------------------
  exportJSON() {
    return JSON.stringify(this.state, null, 2);
  },

  importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || !('mountains' in parsed)) {
      throw new Error('El archivo no parece una copia de Cumbre.');
    }
    this.state = Object.assign(defaultState(), parsed);
    this.state.settings = Object.assign(defaultState().settings, parsed.settings || {});
    this.save();
  },

  reset() {
    this.state = defaultState();
    this.save();
  },

  // --- Datos de ejemplo (para verla poblada) --------------------------------
  loadExamples() {
    const name = this.state.user.name;
    this.state = defaultState();
    this.state.user.name = name;
    this.state.onboarded = true;
    const m1 = this.createMountain({
      title: 'Aprender inglés',
      why: 'Para poder trabajar en el extranjero y no tener miedo a hablar.',
      type: 'goal', color: 'purple', topic: 'ingles',
      milestones: ['Vocabulario básico', 'Presentarme sin notas', 'Conversación de 5 min', 'Ver una peli sin subtítulos'],
      dailyActions: ['Estudiar inglés 20 min'],
    });
    // Marca los dos primeros hitos como hechos (60% aprox.)
    m1.milestones[0].done = true; m1.milestones[0].doneAt = todayKey();
    m1.milestones[1].done = true; m1.milestones[1].doneAt = todayKey();

    this.createMountain({
      title: 'Media maratón',
      why: 'Demostrarme que mi cuerpo aguanta más de lo que creo.',
      type: 'goal', color: 'blue', topic: 'running',
      milestones: ['Correr 5 km sin parar', 'Correr 10 km', 'Correr 15 km', 'Completar 21 km'],
      dailyActions: ['Correr 3 km'],
    });
    this.createMountain({
      title: 'Hábito de lectura',
      why: 'Quiero volver a disfrutar de un buen libro cada noche.',
      type: 'habit', color: 'teal', topic: 'lectura',
      milestones: ['Leer 7 días seguidos', 'Terminar 1 libro', 'Terminar 3 libros', 'Leer 30 días seguidos'],
      dailyActions: ['Leer 10 páginas'],
    });
    m1; // noop
    // Marca alguna actividad reciente para que la racha no salga a cero
    const acts = this.todaysActions();
    for (let i = 1; i <= 12; i++) {
      const k = addDays(todayKey(), -i);
      const some = acts.slice(0, 2).map(a => a.id);
      this.state.log[k] = { done: some, reflection: '' };
    }
    this.save();
  },
};
