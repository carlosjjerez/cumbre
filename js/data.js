// ============================================================================
//  data.js — Contenido estático de la app
//  - ICONS:      iconos SVG (línea, estilo Tabler, MIT) que usa la interfaz
//  - PALETTE:    colores disponibles para las montañas
//  - TOPICS:     temas para el "dato del día"
//  - CONTENT:    las píldoras de aprendizaje por tema
//  Todo esto viaja dentro de la app: funciona sin internet y sin coste.
// ============================================================================

// --- Iconos (viewBox 0 0 24 24, trazo currentColor) -------------------------
const ICONS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M3 12h1M20 12h1M12 3v1M12 20v1M5.6 5.6l.7 .7M17.7 17.7l.7 .7M18.4 5.6l-.7 .7M6.3 17.7l-.7 .7"/>',
  mountain: '<path d="M3 20l7 -12l4 7l2 -3l5 8z"/>',
  chart: '<path d="M4 4v16h16"/><path d="M8 15l3 -4l3 2l4 -6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  settings: '<path d="M4 8h4M4 8a2 2 0 1 0 4 0a2 2 0 0 0 -4 0M8 8h12M4 16h8M16 16h4M12 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/>',
  check: '<path d="M5 12l5 5l9 -11"/>',
  circle: '<circle cx="12" cy="12" r="8.5"/>',
  circleCheck: '<circle cx="12" cy="12" r="8.5"/><path d="M9 12l2 2l4 -4"/>',
  flame: '<path d="M12 2c1 4 5 5 5 9a5 5 0 0 1 -10 0c0 -2 1 -3 1 -3c0 1 1 2 2 2c0 -3 1 -5 2 -8z" fill="currentColor" stroke="none"/>',
  quote: '<path d="M8 11h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2 -1 3 -3 4M18 11h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2 -1 3 -3 4"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  arrowLeft: '<path d="M5 12h14M5 12l6 6M5 12l6 -6"/>',
  download: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2M7 11l5 5l5 -5M12 4v12"/>',
  upload: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2M7 9l5 -5l5 5M12 4v12"/>',
  x: '<path d="M6 6l12 12M6 18l12 -12"/>',
  bell: '<path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6M9 17v1a3 3 0 0 0 6 0v-1"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>',
  edit: '<path d="M7 21h-3a1 1 0 0 1 -1 -1v-3l11 -11l4 4l-11 11M13 6l4 4"/>',
  bulb: '<path d="M9 18h6M10 21h4M8.5 14a5 5 0 1 1 7 0c-.8 .8 -1.5 1.5 -1.5 3h-4c0 -1.5 -.7 -2.2 -1.5 -3z"/>',
  location: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  trophy: '<path d="M8 4h8v4a4 4 0 0 1 -8 0zM8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1 -3 3M10 14h4l-1 4h-2zM9 21h6"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>',
  book: '<path d="M4 5a2 2 0 0 1 2 -2h8v16h-8a2 2 0 0 0 -2 2zM14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 0 -2 -2h-4"/>',
  run: '<circle cx="14" cy="5" r="2"/><path d="M12 8l-2 3l3 2v5M10 11l-4 -1M13 13l3 1l1 3"/>',
  chevronRight: '<path d="M9 6l6 6l-6 6"/>',
};

function icon(name, size = 24, cls = '') {
  const body = ICONS[name] || '';
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// --- Colores de montaña -----------------------------------------------------
const PALETTE = [
  { id: 'teal',   base: '#1D9E75', deep: '#0F6E56', soft: '#E1F5EE', snow: '#EAF9F3' },
  { id: 'blue',   base: '#2F7DD1', deep: '#185FA5', soft: '#E6F1FB', snow: '#EEF6FD' },
  { id: 'purple', base: '#6C63D8', deep: '#4A429E', soft: '#EEEDFE', snow: '#F4F3FE' },
  { id: 'coral',  base: '#D85A30', deep: '#993C1D', soft: '#FAECE7', snow: '#FCF2ee' },
  { id: 'pink',   base: '#D4537E', deep: '#993556', soft: '#FBEAF0', snow: '#FDF1F5' },
  { id: 'amber',  base: '#C98A17', deep: '#854F0B', soft: '#FAEEDA', snow: '#FCF5E6' },
  { id: 'green',  base: '#5E9E22', deep: '#3B6D11', soft: '#EAF3DE', snow: '#F2F8E9' },
];
function paletteOf(id) { return PALETTE.find(p => p.id === id) || PALETTE[0]; }

// --- Temas del "dato del día" ----------------------------------------------
const TOPICS = [
  { id: 'motivacion',   label: 'Motivación',    icon: 'flame' },
  { id: 'ingles',       label: 'Inglés',        icon: 'book' },
  { id: 'running',      label: 'Running',       icon: 'run' },
  { id: 'lectura',      label: 'Lectura',       icon: 'book' },
  { id: 'productividad',label: 'Productividad', icon: 'bulb' },
  { id: 'salud',        label: 'Salud',         icon: 'target' },
  { id: 'finanzas',     label: 'Finanzas',      icon: 'chart' },
];
function topicOf(id) { return TOPICS.find(t => t.id === id) || TOPICS[0]; }

// --- Píldoras de aprendizaje ------------------------------------------------
// Cada item: { t: título/término, d: explicación breve }
const CONTENT = {
  motivacion: [
    { t: 'Empieza pequeño', d: 'Un objetivo de 2 minutos es imposible de aplazar. La constancia nace de lo diminuto, no de lo heroico.' },
    { t: 'La regla de no fallar dos veces', d: 'Fallar un día es un accidente; fallar dos es el principio de un hábito nuevo. Vuelve siempre al día siguiente.' },
    { t: 'Motivación sigue a la acción', d: 'No esperes a tener ganas para empezar. Empieza, y las ganas suelen aparecer por el camino.' },
    { t: 'Hazlo visible', d: 'Lo que se mide, mejora. Ver tu racha o tu progreso pintado es de los motores más potentes que existen.' },
    { t: 'Tu identidad manda', d: 'No es "quiero correr", es "soy alguien que corre". Los hábitos se sostienen sobre quién quieres ser.' },
    { t: 'El 1% diario', d: 'Mejorar un 1% cada día te deja 37 veces mejor en un año. Lo pequeño, sostenido, es enorme.' },
    { t: 'Diseña el entorno', d: 'Pon las zapatillas a la vista, el libro en la almohada. Facilita el buen hábito y estorba al malo.' },
    { t: 'Celebra al terminar', d: 'Un pequeño "¡bien!" tras cumplir le dice a tu cerebro: repite esto. El refuerzo inmediato consolida el hábito.' },
    { t: 'El porqué te levanta', d: 'En los días flojos, la disciplina falla antes que el propósito. Ten muy claro para qué haces lo que haces.' },
    { t: 'Progreso, no perfección', d: 'Media montaña subida sigue siendo más de lo que tenías ayer. No tires lo hecho por lo que falta.' },
    { t: 'Ata el hábito a otro', d: '"Después de mi café, leo 10 minutos." Enganchar lo nuevo a algo que ya haces lo hace casi automático.' },
    { t: 'Descansar también cuenta', d: 'El descanso no es abandonar la montaña, es coger fuerzas para el siguiente escalón. Prográmalo sin culpa.' },
  ],
  ingles: [
    { t: 'to look forward to', d: 'Esperar algo con ilusión. "I look forward to the weekend" = tengo ganas de que llegue el finde.' },
    { t: 'to keep up', d: 'Mantener el ritmo, seguir el paso. "Keep up the good work" = sigue así de bien.' },
    { t: 'to give up', d: 'Rendirse, abandonar. "Never give up on your goals" = nunca abandones tus objetivos.' },
    { t: 'to work out', d: 'Entrenar; o resolverse bien. "It will work out" = saldrá bien. "I work out daily" = entreno a diario.' },
    { t: 'to figure out', d: 'Averiguar, resolver algo. "I need to figure this out" = necesito resolver esto.' },
    { t: 'step by step', d: 'Paso a paso. Perfecto para tu app: "climb the mountain step by step".' },
    { t: 'to get the hang of it', d: 'Cogerle el truco a algo. "You will get the hang of it" = le vas a coger el tranquillo.' },
    { t: 'right away', d: 'Ahora mismo, de inmediato. "I will do it right away" = lo hago enseguida.' },
    { t: 'to make progress', d: 'Progresar, avanzar. "You are making great progress" = estás avanzando genial.' },
    { t: 'no matter what', d: 'Pase lo que pase. "I will finish no matter what" = lo terminaré pase lo que pase.' },
    { t: 'to stick to', d: 'Ceñirse a algo, no abandonarlo. "Stick to the plan" = cíñete al plan.' },
    { t: 'day by day', d: 'Día a día. "Day by day, it gets easier" = día a día se hace más fácil.' },
  ],
  running: [
    { t: 'Empieza más lento de lo que crees', d: 'La mayoría corre demasiado rápido al principio. Si puedes hablar mientras corres, vas al ritmo correcto.' },
    { t: 'La regla del 10%', d: 'No subas tu distancia semanal más de un 10% para evitar lesiones. La paciencia protege las rodillas.' },
    { t: 'Cadencia ~170-180', d: 'Dar pasos más cortos y frecuentes reduce el impacto. Cuenta tus pasos en 15s y multiplica por 4.' },
    { t: 'Corre / camina', d: 'Alternar correr y andar (p. ej. 2 min / 1 min) es la forma más sólida de empezar sin frustrarte.' },
    { t: 'El calentamiento importa', d: '5 minutos de caminar rápido o trotar suave preparan el músculo y evitan tirones.' },
    { t: 'Hidrátate antes, no solo después', d: 'Llegar bien hidratado a la carrera rinde más que beber a lo bruto al acabar.' },
    { t: 'Días de descanso = progreso', d: 'El músculo se fortalece descansando, no corriendo. Un buen plan incluye días sin correr.' },
    { t: 'La técnica: mira al frente', d: 'Vista al horizonte, hombros relajados, brazos a 90°. El cuerpo sigue a la mirada.' },
    { t: 'La regla de los 3 días', d: 'Corre al menos 3 días por semana para progresar de forma estable sin sobrecargar.' },
    { t: 'Escucha el dolor bueno y el malo', d: 'Molestia muscular difusa: normal. Dolor agudo y localizado: para. Aprender a distinguirlos evita lesiones.' },
  ],
  lectura: [
    { t: 'La regla de las 25 páginas', d: 'Leer solo 25 páginas al día son más de 30 libros al año. Lo constante gana a lo intenso.' },
    { t: 'Ten siempre un libro a mano', d: 'Los ratos muertos (cola, transporte) suman horas de lectura si el libro está accesible en el móvil o bolsillo.' },
    { t: 'Abandonar un libro está permitido', d: 'La vida es corta. Si un libro no te aporta a las 50 páginas, déjalo sin culpa y coge otro.' },
    { t: 'Subraya y anota', d: 'Leer con lápiz convierte la lectura pasiva en aprendizaje activo. Vuelve luego a tus notas.' },
    { t: 'La técnica del resumen', d: 'Al acabar un capítulo, resúmelo en una frase. Si no puedes, reléelo: no lo has asimilado.' },
    { t: 'Lee lo que te apasiona', d: 'El mejor libro para engancharte a leer es el que no puedes soltar, no el que "deberías" leer.' },
    { t: 'Antes de dormir, no pantallas: papel', d: 'Cambiar el móvil por 10 páginas mejora el sueño y crea un ritual de lectura difícil de romper.' },
    { t: 'Relee lo que te marcó', d: 'Un gran libro da más en la segunda lectura. Releer no es perder el tiempo, es profundizar.' },
    { t: 'La lista de "por leer"', d: 'Anota los libros que te recomiendan. Nunca te faltará el siguiente escalón que subir.' },
  ],
  productividad: [
    { t: 'La regla de los 2 minutos', d: 'Si algo lleva menos de 2 minutos, hazlo ya. Aplazar lo pequeño llena la cabeza de ruido.' },
    { t: 'Una sola cosa importante al día', d: 'Elige la tarea que, si la haces, el día ya ha valido la pena. Hazla primero.' },
    { t: 'Time blocking', d: 'Reserva bloques de tiempo en tu día para tareas concretas. Lo que tiene hora, se hace.' },
    { t: 'La técnica Pomodoro', d: '25 minutos de foco + 5 de descanso. Vencer la pereza es más fácil si solo prometes 25 minutos.' },
    { t: 'Cierra pestañas mentales', d: 'Anota lo que tengas en la cabeza. La mente es para pensar ideas, no para almacenarlas.' },
    { t: 'Empieza por lo difícil', d: '"Cómete la rana": haz lo más duro a primera hora, cuando tienes más energía y menos excusas.' },
    { t: 'Menos es más', d: 'Tres prioridades claras rinden más que quince tareas dispersas. Enfócate, no te disperses.' },
    { t: 'Descansa de verdad', d: 'Mirar el móvil no descansa el cerebro. Un paseo o mirar por la ventana sí recargan de verdad.' },
  ],
  salud: [
    { t: 'Bebe agua al despertar', d: 'Tras horas sin beber, un vaso de agua al levantarte reactiva el cuerpo mejor que nada.' },
    { t: 'La mitad del plato, verdura', d: 'Un truco simple para comer mejor sin contar calorías: que la mitad de tu plato sea vegetal.' },
    { t: 'Muévete cada hora', d: 'Estar sentado mucho pasa factura. Levántate y anda 2 minutos cada hora: tu espalda lo agradece.' },
    { t: 'El sueño es rendimiento', d: 'Dormir 7-8h mejora memoria, ánimo y voluntad. Ningún hábito compensa dormir mal de forma crónica.' },
    { t: 'Luz de sol por la mañana', d: '10 minutos de luz natural al despertar regulan tu reloj interno y te ayudan a dormir mejor de noche.' },
    { t: 'Mastica despacio', d: 'La sensación de saciedad tarda ~20 minutos. Comer sin prisa ayuda a comer lo justo.' },
    { t: 'Respira para calmarte', d: 'Inhala 4s, retén 4s, exhala 6s. Alargar la exhalación activa la calma en menos de un minuto.' },
    { t: 'Fuerza = juventud', d: 'Mantener músculo con los años protege huesos, metabolismo y autonomía. Nunca es tarde para empezar.' },
  ],
  finanzas: [
    { t: 'Págate a ti primero', d: 'Aparta el ahorro en cuanto cobras, no lo que sobra a fin de mes. Automatízalo y ni lo notarás.' },
    { t: 'El fondo de emergencia', d: 'Tener 3-6 meses de gastos guardados te da tranquilidad y evita deudas ante imprevistos.' },
    { t: 'La regla 50/30/20', d: '50% necesidades, 30% gustos, 20% ahorro/deuda. Una guía simple para repartir lo que ganas.' },
    { t: 'El interés compuesto', d: 'El dinero invertido genera rendimientos que generan más rendimientos. El tiempo es tu mayor aliado.' },
    { t: 'Anota tus gastos', d: 'No puedes controlar lo que no ves. Registrar gastos una semana revela fugas que no imaginabas.' },
    { t: 'Cuidado con las suscripciones', d: 'Pequeños cargos mensuales suman mucho al año. Revisa y cancela lo que no usas de verdad.' },
    { t: 'Deuda cara primero', d: 'Amortiza antes la deuda con más interés (tarjetas). Ahorrar al 1% mientras debes al 20% no compensa.' },
    { t: 'Compra tiempo, no cosas', d: 'Los estudios coinciden: gastar en experiencias y en librarte de tareas da más felicidad que acumular objetos.' },
  ],
};

// Devuelve el dato del día de forma estable (mismo día = mismo dato) y rotando
// entre los temas activos del usuario.
function getDailyFact(dayNumber, activeTopics) {
  const topics = (activeTopics && activeTopics.length) ? activeTopics : ['motivacion'];
  const topicId = topics[dayNumber % topics.length];
  const pack = CONTENT[topicId] || CONTENT.motivacion;
  const itemIndex = Math.floor(dayNumber / topics.length) % pack.length;
  return { topic: topicOf(topicId), item: pack[itemIndex] };
}
