// ==================== КОНФІГУРАЦІЯ ====================

// Напрямки діяльності
const DIRECTIONS = {
  SERVICE: "Службова діяльність",
  CHEMISTRY: "Хімія",
  PYRO: "Піротехніка",
  OTHER: "Інше",
};

// Відповідальні особи
const RESPONSIBLE_PERSONS = ["Мороз В.В.", "Лукащук Ф.М.", "Сторожук А.Л."];

// Варіанти періодичності
const PERIODICITY_OPTIONS = [
  { value: "Одноразово", label: "Одноразово" },
  { value: "Щодня", label: "Щодня" },
  { value: "Щотижня", label: "Щотижня" },
  { value: "Щомісяця", label: "Щомісяця" },
  { value: "Щокварталу", label: "Щокварталу" },
  { value: "Раз на півроку", label: "Раз на півроку" },
  { value: "Щорічно", label: "Щорічно" },
  { value: "За потреби", label: "За потреби" },
];

// Статуси виконання
const STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
};

const STATUS_LABELS = {
  [STATUSES.PENDING]: "Очікує",
  [STATUSES.IN_PROGRESS]: "В роботі",
  [STATUSES.COMPLETED]: "Виконано",
};

const STATUS_CLASSES = {
  [STATUSES.PENDING]: "status-pending",
  [STATUSES.IN_PROGRESS]: "status-in-progress",
  [STATUSES.COMPLETED]: "status-completed",
};

// Іконки для статистики
const STATS_ICONS = {
  total: "📊",
  completed: "✅",
  inProgress: "⏳",
  pending: "⏰",
  overdue: "⚠️",
  service: "📋",
  chemistry: "🧪",
  pyro: "💥",
  other: "🔄",
};

// Функція для отримання всіх напрямків (включаючи динамічні)
function getAllDirections(records = []) {
  const baseDirections = Object.values(DIRECTIONS);

  // Додаємо унікальні напрямки з поля "Інше"
  const otherDirections = records
    .filter((r) => r.direction === DIRECTIONS.OTHER && r.customDirection)
    .map((r) => `${DIRECTIONS.OTHER}: ${r.customDirection}`);

  return [...baseDirections, ...otherDirections];
}

// Функція для перевірки чи є напрямок стандартним
function isStandardDirection(direction) {
  return Object.values(DIRECTIONS).includes(direction);
}
