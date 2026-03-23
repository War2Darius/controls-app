// ==================== КОНФІГУРАЦІЯ ====================

const STORAGE_KEYS = {
  RESPONSIBLE: "controls_responsible_persons",
  DIRECTIONS: "controls_directions",
  PERIODICITY: "controls_periodicity",
  STATUS_LABELS: "controls_status_labels",
};

// Напрямки діяльності (тільки для резервного використання)
const DEFAULT_DIRECTIONS = {
  SERVICE: "Службова діяльність",
  CHEMISTRY: "Хімія",
  PYRO: "Піротехніка",
  OTHER: "Інше",
};

// Напрямки (з localStorage)
function getDirections() {
  const stored = localStorage.getItem(STORAGE_KEYS.DIRECTIONS);
  if (stored) {
    return JSON.parse(stored);
  }
  return Object.values(DEFAULT_DIRECTIONS);
}

function setDirections(directions) {
  localStorage.setItem(STORAGE_KEYS.DIRECTIONS, JSON.stringify(directions));
}

function addDirection(name) {
  const directions = getDirections();
  if (name && !directions.includes(name)) {
    directions.push(name);
    setDirections(directions);
  }
  return directions;
}

function removeDirectionFromList(name) {
  const directions = getDirections().filter((d) => d !== name);
  setDirections(directions);
  return directions;
}

function updateDirection(oldName, newName) {
  const directions = getDirections();
  const index = directions.indexOf(oldName);
  if (index !== -1 && newName) {
    directions[index] = newName;
    setDirections(directions);
  }
  return directions;
}

// Для зворотної сумісності - OBJECT для використання в коді
const DIRECTIONS = {
  get SERVICE() { return getDirections()[0] || "Службова діяльність"; },
  get CHEMISTRY() { return getDirections()[1] || "Хімія"; },
  get PYRO() { return getDirections()[2] || "Піротехніка"; },
  get OTHER() { return getDirections()[3] || "Інше"; },
};

// Отримати всі напрямки як масив
function getDirectionsArray() {
  return getDirections();
}

// Відповідальні особи (з localStorage)
function getResponsiblePersons() {
  const stored = localStorage.getItem(STORAGE_KEYS.RESPONSIBLE);
  if (stored) {
    return JSON.parse(stored);
  }
  return ["Відповідальний 1", "Відповідальний 2", "Відповідальний 3"];
}

function setResponsiblePersons(persons) {
  localStorage.setItem(STORAGE_KEYS.RESPONSIBLE, JSON.stringify(persons));
}

function addResponsiblePerson(name) {
  const persons = getResponsiblePersons();
  if (name && !persons.includes(name)) {
    persons.push(name);
    setResponsiblePersons(persons);
  }
  return persons;
}

function removeResponsiblePerson(name) {
  const persons = getResponsiblePersons().filter((p) => p !== name);
  setResponsiblePersons(persons);
  return persons;
}

// Варіанти періодичності (з localStorage)
function getPeriodicityOptions() {
  const stored = localStorage.getItem(STORAGE_KEYS.PERIODICITY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [
    { value: "p_1", label: "Одноразово" },
    { value: "p_2", label: "Щодня" },
    { value: "p_3", label: "Щотижня" },
    { value: "p_4", label: "Щомісяця" },
    { value: "p_5", label: "Щокварталу" },
    { value: "p_6", label: "Раз на півроку" },
    { value: "p_7", label: "Щорічно" },
    { value: "p_8", label: "За потреби" },
  ];
}

function setPeriodicityOptions(options) {
  localStorage.setItem(STORAGE_KEYS.PERIODICITY, JSON.stringify(options));
}

function addPeriodicityOption(label) {
  const options = getPeriodicityOptions();
  const value = "p_" + Date.now(); // Унікальний ID
  if (label && !options.find(o => o.label === label)) {
    options.push({ value, label });
    setPeriodicityOptions(options);
  }
  return options;
}

function removePeriodicityOption(value) {
  const options = getPeriodicityOptions().filter(o => o.value !== value);
  setPeriodicityOptions(options);
  return options;
}

function updatePeriodicityOption(oldValue, newValue, newLabel) {
  const options = getPeriodicityOptions();
  const index = options.findIndex(o => o.value === oldValue);
  if (index !== -1) {
    options[index] = { value: newValue, label: newLabel };
    setPeriodicityOptions(options);
  }
  return options;
}

// Статуси виконання (з localStorage)
const DEFAULT_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
};

function getStatusLabels() {
  const stored = localStorage.getItem(STORAGE_KEYS.STATUS_LABELS);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    [DEFAULT_STATUSES.PENDING]: "Очікує",
    [DEFAULT_STATUSES.IN_PROGRESS]: "В роботі",
    [DEFAULT_STATUSES.COMPLETED]: "Виконано",
  };
}

function setStatusLabels(labels) {
  localStorage.setItem(STORAGE_KEYS.STATUS_LABELS, JSON.stringify(labels));
}

function updateStatusLabel(key, newLabel) {
  const labels = getStatusLabels();
  if (labels[key] !== undefined) {
    labels[key] = newLabel;
    setStatusLabels(labels);
  }
  return labels;
}

function getStatusKeys() {
  return Object.keys(getStatusLabels());
}

// Для сумісності
const PERIODICITY_OPTIONS = getPeriodicityOptions();
const STATUSES = DEFAULT_STATUSES;
const STATUS_LABELS = getStatusLabels();

const STATUS_CLASSES = {
  [DEFAULT_STATUSES.PENDING]: "status-pending",
  [DEFAULT_STATUSES.IN_PROGRESS]: "status-in-progress",
  [DEFAULT_STATUSES.COMPLETED]: "status-completed",
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
  const baseDirections = getDirections();

  // Додаємо унікальні напрямки з поля "Інше"
  const otherDirections = records
    .filter((r) => r.direction === "Інше" && r.customDirection)
    .map((r) => `Інше: ${r.customDirection}`);

  return [...baseDirections, ...otherDirections];
}

// Функція для перевірки чи є напрямок стандартним
function isStandardDirection(direction) {
  return getDirections().includes(direction);
}

// Глобальні функції
window.getDirections = getDirections;
window.addDirection = addDirection;
window.removeDirectionFromList = removeDirectionFromList;
window.updateDirection = updateDirection;
window.getResponsiblePersons = getResponsiblePersons;
window.addResponsiblePerson = addResponsiblePerson;
window.removeResponsiblePerson = removeResponsiblePerson;
window.setDirections = setDirections;
window.setResponsiblePersons = setResponsiblePersons;
window.getPeriodicityOptions = getPeriodicityOptions;
window.addPeriodicityOption = addPeriodicityOption;
window.removePeriodicityOption = removePeriodicityOption;
window.updatePeriodicityOption = updatePeriodicityOption;
window.getStatusLabels = getStatusLabels;
window.updateStatusLabel = updateStatusLabel;
window.getStatusKeys = getStatusKeys;
window.STATUSES = DEFAULT_STATUSES;
window.STATUS_LABELS = STATUS_LABELS;
