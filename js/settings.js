// ==================== НАЛАШТУВАННЯ ====================

// Ключі для localStorage
const STORAGE_KEYS = {
  RESPONSIBLE: "app_settings_responsible",
  STATUSES: "app_settings_statuses",
  DIRECTIONS: "app_settings_directions",
};

// Стандартні значення (якщо в localStorage порожньо)
const DEFAULT_SETTINGS = {
  responsible: ["Мороз В.В.", "Лукащук Ф.М.", "Сторожук А.Л."],
  statuses: [
    { id: "pending", name: "Очікує", color: "#fed7d7", icon: "⏰" },
    { id: "in-progress", name: "В роботі", color: "#feebc8", icon: "⏳" },
    { id: "completed", name: "Виконано", color: "#c6f6d5", icon: "✅" },
  ],
  directions: [
    { id: "service", name: "Службова діяльність", icon: "📋" },
    { id: "chemistry", name: "Хімія", icon: "🧪" },
    { id: "pyro", name: "Піротехніка", icon: "💥" },
    { id: "other", name: "Інше", icon: "🔄" },
  ],
};

// Завантаження налаштувань з localStorage
function loadSettings() {
  try {
    // Відповідальні
    const savedResponsible = localStorage.getItem(STORAGE_KEYS.RESPONSIBLE);
    if (savedResponsible) {
      RESPONSIBLE_PERSONS.length = 0;
      RESPONSIBLE_PERSONS.push(...JSON.parse(savedResponsible));
    }

    // Статуси
    const savedStatuses = localStorage.getItem(STORAGE_KEYS.STATUSES);
    if (savedStatuses) {
      const statuses = JSON.parse(savedStatuses);

      // Оновлюємо STATUSES, STATUS_LABELS, STATUS_CLASSES
      Object.keys(STATUSES).forEach((key) => delete STATUSES[key]);
      Object.keys(STATUS_LABELS).forEach((key) => delete STATUS_LABELS[key]);
      Object.keys(STATUS_CLASSES).forEach((key) => delete STATUS_CLASSES[key]);

      statuses.forEach((s) => {
        STATUSES[s.id.toUpperCase().replace("-", "_")] = s.id;
        STATUS_LABELS[s.id] = s.name;
        STATUS_CLASSES[s.id] = `status-${s.id}`;
      });
    }

    // Напрямки
    const savedDirections = localStorage.getItem(STORAGE_KEYS.DIRECTIONS);
    if (savedDirections) {
      const directions = JSON.parse(savedDirections);

      // Оновлюємо DIRECTIONS
      Object.keys(DIRECTIONS).forEach((key) => delete DIRECTIONS[key]);

      directions.forEach((d) => {
        DIRECTIONS[d.id.toUpperCase()] = d.name;
      });
    }

    // Оновлюємо випадаючі списки, якщо вони вже створені
    if (typeof populateSelects === "function") {
      populateSelects();
    }
  } catch (error) {
    console.error("Помилка завантаження налаштувань:", error);
  }
}

// Збереження налаштувань
function saveSettings() {
  try {
    // Зберігаємо відповідальних
    localStorage.setItem(
      STORAGE_KEYS.RESPONSIBLE,
      JSON.stringify(RESPONSIBLE_PERSONS),
    );

    // Зберігаємо статуси
    const statuses = Object.keys(STATUSES).map((key) => ({
      id: STATUSES[key],
      name: STATUS_LABELS[STATUSES[key]],
      icon: getStatusIcon(STATUSES[key]),
    }));
    localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(statuses));

    // Зберігаємо напрямки
    const directions = Object.keys(DIRECTIONS).map((key) => ({
      id: key.toLowerCase(),
      name: DIRECTIONS[key],
      icon: getDirectionIcon(DIRECTIONS[key]),
    }));
    localStorage.setItem(STORAGE_KEYS.DIRECTIONS, JSON.stringify(directions));

    // Показуємо сповіщення
    showNotification("Налаштування збережено", "success");
  } catch (error) {
    console.error("Помилка збереження налаштувань:", error);
    showNotification("Помилка при збереженні", "error");
  }
}

// Скидання до стандартних налаштувань
function resetToDefault() {
  if (confirm("Скинути всі налаштування до стандартних?")) {
    // Відповідальні
    RESPONSIBLE_PERSONS.length = 0;
    RESPONSIBLE_PERSONS.push(...DEFAULT_SETTINGS.responsible);

    // Статуси
    Object.keys(STATUSES).forEach((key) => delete STATUSES[key]);
    Object.keys(STATUS_LABELS).forEach((key) => delete STATUS_LABELS[key]);
    Object.keys(STATUS_CLASSES).forEach((key) => delete STATUS_CLASSES[key]);

    DEFAULT_SETTINGS.statuses.forEach((s) => {
      STATUSES[s.id.toUpperCase().replace("-", "_")] = s.id;
      STATUS_LABELS[s.id] = s.name;
      STATUS_CLASSES[s.id] = `status-${s.id}`;
    });

    // Напрямки
    Object.keys(DIRECTIONS).forEach((key) => delete DIRECTIONS[key]);
    DEFAULT_SETTINGS.directions.forEach((d) => {
      DIRECTIONS[d.id.toUpperCase()] = d.name;
    });

    // Зберігаємо
    saveSettings();

    // Оновлюємо інтерфейс
    if (typeof populateSelects === "function") populateSelects();
    if (typeof loadData === "function") loadData();

    closeSettingsModal();
  }
}

// Отримати іконку для статусу
function getStatusIcon(statusId) {
  const icons = {
    pending: "⏰",
    "in-progress": "⏳",
    completed: "✅",
  };
  return icons[statusId] || "📌";
}

// Отримати іконку для напрямку
function getDirectionIcon(directionName) {
  const icons = {
    "Службова діяльність": "📋",
    Хімія: "🧪",
    Піротехніка: "💥",
    Інше: "🔄",
  };
  return icons[directionName] || "📌";
}

// ==================== МОДАЛЬНЕ ВІКНО ====================

// Відкрити модальне вікно налаштувань
function openSettingsModal() {
  // Видаляємо старе модальне вікно, якщо є
  const oldModal = document.querySelector(".settings-modal-overlay");
  if (oldModal) oldModal.remove();

  // Створюємо затемнений фон
  const overlay = document.createElement("div");
  overlay.className = "settings-modal-overlay";

  // Створюємо модальне вікно
  const modal = document.createElement("div");
  modal.className = "settings-modal";

  // Формуємо HTML для налаштувань
  modal.innerHTML = `
        <div class="settings-modal-header">
            <h2>⚙️ Налаштування</h2>
            <button class="settings-modal-close" onclick="closeSettingsModal()">✕</button>
        </div>

        <div class="settings-modal-tabs">
            <button class="settings-tab active" onclick="switchSettingsTab('responsible')">👤 Відповідальні</button>
            <button class="settings-tab" onclick="switchSettingsTab('statuses')">🏷️ Статуси</button>
            <button class="settings-tab" onclick="switchSettingsTab('directions')">🎯 Напрямки</button>
            <button class="settings-tab" onclick="switchSettingsTab('import')">📦 Імпорт/Експорт</button>
        </div>

        <div class="settings-modal-content">
            <!-- Вкладка Відповідальні -->
            <div id="settings-tab-responsible" class="settings-tab-content active">
                <h3>👤 Список відповідальних осіб</h3>
                <p class="settings-description">Додавайте, редагуйте та видаляйте відповідальних осіб</p>

                <div class="settings-items-list" id="responsible-list">
                    ${RESPONSIBLE_PERSONS.map(
                      (person, index) => `
                        <div class="settings-item">
                            <span>${person}</span>
                            <div>
                                <button class="settings-item-btn edit" onclick="editResponsible(${index})">✏️</button>
                                <button class="settings-item-btn delete" onclick="deleteResponsible(${index})">🗑️</button>
                            </div>
                        </div>
                    `,
                    ).join("")}
                </div>

                <div class="settings-add-form">
                    <input type="text" id="new-responsible" placeholder="ПІБ (наприклад: Петренко П.П.)">
                    <button onclick="addResponsible()">➕ Додати</button>
                </div>
            </div>

            <!-- Вкладка Статуси -->
            <div id="settings-tab-statuses" class="settings-tab-content">
                <h3>🏷️ Статуси виконання</h3>
                <p class="settings-description">Налаштуйте статуси та їх кольори</p>

                <div class="settings-items-list" id="statuses-list">
                    ${Object.keys(STATUSES)
                      .map((key) => {
                        const id = STATUSES[key];
                        const name = STATUS_LABELS[id];
                        return `
                            <div class="settings-item">
                                <span style="display: flex; align-items: center; gap: 10px;">
                                    <span class="status-badge-preview" style="background: ${getStatusColor(id)}">${name}</span>
                                </span>
                                <div>
                                    <button class="settings-item-btn edit" onclick="editStatus('${id}')">✏️</button>
                                    <button class="settings-item-btn delete" onclick="deleteStatus('${id}')">🗑️</button>
                                </div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>

                <div class="settings-add-form">
                    <input type="text" id="new-status-name" placeholder="Назва статусу">
                    <input type="color" id="new-status-color" value="#667eea">
                    <button onclick="addStatus()">➕ Додати</button>
                </div>
            </div>

            <!-- Вкладка Напрямки -->
            <div id="settings-tab-directions" class="settings-tab-content">
                <h3>🎯 Напрямки діяльності</h3>
                <p class="settings-description">Налаштуйте напрямки для фільтрації</p>

                <div class="settings-items-list" id="directions-list">
                    ${Object.keys(DIRECTIONS)
                      .map(
                        (key) => `
                        <div class="settings-item">
                            <span>${getDirectionIcon(DIRECTIONS[key])} ${DIRECTIONS[key]}</span>
                            <div>
                                <button class="settings-item-btn edit" onclick="editDirection('${key}')">✏️</button>
                                <button class="settings-item-btn delete" onclick="deleteDirection('${key}')">🗑️</button>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>

                <div class="settings-add-form">
                    <input type="text" id="new-direction-name" placeholder="Назва напрямку">
                    <input type="text" id="new-direction-icon" placeholder="Іконка (наприклад: 🚀)" maxlength="2">
                    <button onclick="addDirection()">➕ Додати</button>
                </div>
            </div>

            <!-- Вкладка Імпорт/Експорт -->
            <div id="settings-tab-import" class="settings-tab-content">
                <h3>📦 Імпорт та експорт</h3>
                <p class="settings-description">Експортуйте налаштування для резервного копіювання</p>

                <div class="settings-import-export">
                    <button class="settings-export-btn" onclick="exportSettings()">
                        📥 Експорт налаштувань
                    </button>
                    <button class="settings-import-btn" onclick="importSettings()">
                        📂 Імпорт налаштувань
                    </button>
                    <button class="settings-reset-btn" onclick="resetToDefault()">
                        🔄 Скинути до стандартних
                    </button>
                </div>

                <div class="settings-import-export">
                    <button class="settings-export-btn" onclick="exportToJSON()">
                        📥 Експорт даних (JSON)
                    </button>
                    <button class="settings-import-btn" onclick="importFromJSON()">
                        📂 Імпорт даних (JSON)
                    </button>
                </div>
            </div>
        </div>

        <div class="settings-modal-footer">
            <button class="settings-save-btn" onclick="saveSettingsAndClose()">💾 Зберегти</button>
            <button class="settings-cancel-btn" onclick="closeSettingsModal()">Скасувати</button>
        </div>
    `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Додаємо обробник для закриття по кліку на фон
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSettingsModal();
  });
}

// Закрити модальне вікно
function closeSettingsModal() {
  const modal = document.querySelector(".settings-modal-overlay");
  if (modal) {
    modal.remove();
  }
}

// Зберегти і закрити
function saveSettingsAndClose() {
  saveSettings();
  closeSettingsModal();

  // Оновлюємо дані
  if (typeof loadData === "function") loadData();
}

// Перемикання вкладок
function switchSettingsTab(tabId) {
  // Оновлюємо кнопки
  document.querySelectorAll(".settings-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  event.target.classList.add("active");

  // Оновлюємо контент
  document.querySelectorAll(".settings-tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(`settings-tab-${tabId}`).classList.add("active");
}

// ==================== ФУНКЦІЇ ДЛЯ ВІДПОВІДАЛЬНИХ ====================

function addResponsible() {
  const input = document.getElementById("new-responsible");
  const name = input.value.trim();

  if (!name) {
    alert("Введіть ПІБ");
    return;
  }

  if (RESPONSIBLE_PERSONS.includes(name)) {
    alert("Такий відповідальний вже існує");
    return;
  }

  RESPONSIBLE_PERSONS.push(name);
  input.value = "";

  // Оновлюємо список
  updateResponsibleList();
}

function editResponsible(index) {
  const newName = prompt("Редагувати ПІБ:", RESPONSIBLE_PERSONS[index]);
  if (newName && newName.trim()) {
    RESPONSIBLE_PERSONS[index] = newName.trim();
    updateResponsibleList();
  }
}

function deleteResponsible(index) {
  if (confirm(`Видалити ${RESPONSIBLE_PERSONS[index]}?`)) {
    RESPONSIBLE_PERSONS.splice(index, 1);
    updateResponsibleList();
  }
}

function updateResponsibleList() {
  const list = document.getElementById("responsible-list");
  if (list) {
    list.innerHTML = RESPONSIBLE_PERSONS.map(
      (person, index) => `
            <div class="settings-item">
                <span>${person}</span>
                <div>
                    <button class="settings-item-btn edit" onclick="editResponsible(${index})">✏️</button>
                    <button class="settings-item-btn delete" onclick="deleteResponsible(${index})">🗑️</button>
                </div>
            </div>
        `,
    ).join("");
  }
}

// ==================== ФУНКЦІЇ ДЛЯ СТАТУСІВ ====================

function getStatusColor(statusId) {
  const colors = {
    pending: "#fed7d7",
    "in-progress": "#feebc8",
    completed: "#c6f6d5",
  };
  return colors[statusId] || "#e2e8f0";
}

function addStatus() {
  const nameInput = document.getElementById("new-status-name");
  const colorInput = document.getElementById("new-status-color");
  const name = nameInput.value.trim();
  const color = colorInput.value;

  if (!name) {
    alert("Введіть назву статусу");
    return;
  }

  // Створюємо ID з назви
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (STATUS_LABELS[id]) {
    alert("Статус з таким ID вже існує");
    return;
  }

  // Додаємо новий статус
  STATUSES[id.toUpperCase().replace("-", "_")] = id;
  STATUS_LABELS[id] = name;
  STATUS_CLASSES[id] = `status-${id}`;

  nameInput.value = "";

  // Оновлюємо список
  updateStatusesList();
}

function editStatus(id) {
  const newName = prompt("Редагувати назву статусу:", STATUS_LABELS[id]);
  if (newName && newName.trim()) {
    STATUS_LABELS[id] = newName.trim();
    updateStatusesList();
  }
}

function deleteStatus(id) {
  // Не можна видалити стандартні статуси
  if (["pending", "in-progress", "completed"].includes(id)) {
    alert("Стандартні статуси не можна видалити");
    return;
  }

  if (confirm(`Видалити статус "${STATUS_LABELS[id]}"?`)) {
    delete STATUSES[id.toUpperCase().replace("-", "_")];
    delete STATUS_LABELS[id];
    delete STATUS_CLASSES[id];
    updateStatusesList();
  }
}

function updateStatusesList() {
  const list = document.getElementById("statuses-list");
  if (list) {
    list.innerHTML = Object.keys(STATUSES)
      .map((key) => {
        const id = STATUSES[key];
        const name = STATUS_LABELS[id];
        return `
                <div class="settings-item">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <span class="status-badge-preview" style="background: ${getStatusColor(id)}">${name}</span>
                    </span>
                    <div>
                        <button class="settings-item-btn edit" onclick="editStatus('${id}')">✏️</button>
                        <button class="settings-item-btn delete" onclick="deleteStatus('${id}')">🗑️</button>
                    </div>
                </div>
            `;
      })
      .join("");
  }
}

// ==================== ФУНКЦІЇ ДЛЯ НАПРЯМКІВ ====================

function addDirection() {
  const nameInput = document.getElementById("new-direction-name");
  const iconInput = document.getElementById("new-direction-icon");
  const name = nameInput.value.trim();
  const icon = iconInput.value.trim() || "📌";

  if (!name) {
    alert("Введіть назву напрямку");
    return;
  }

  // Створюємо ID з назви
  const id = name
    .toUpperCase()
    .replace(/[^А-ЯA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  if (DIRECTIONS[id]) {
    alert("Напрямок з таким ID вже існує");
    return;
  }

  DIRECTIONS[id] = name;

  nameInput.value = "";
  iconInput.value = "";

  updateDirectionsList();
}

function editDirection(key) {
  const newName = prompt("Редагувати назву напрямку:", DIRECTIONS[key]);
  if (newName && newName.trim()) {
    DIRECTIONS[key] = newName.trim();
    updateDirectionsList();
  }
}

function deleteDirection(key) {
  // Не можна видалити стандартні напрямки
  if (["SERVICE", "CHEMISTRY", "PYRO", "OTHER"].includes(key)) {
    alert("Стандартні напрямки не можна видалити");
    return;
  }

  if (confirm(`Видалити напрямок "${DIRECTIONS[key]}"?`)) {
    delete DIRECTIONS[key];
    updateDirectionsList();
  }
}

function updateDirectionsList() {
  const list = document.getElementById("directions-list");
  if (list) {
    list.innerHTML = Object.keys(DIRECTIONS)
      .map(
        (key) => `
            <div class="settings-item">
                <span>${getDirectionIcon(DIRECTIONS[key])} ${DIRECTIONS[key]}</span>
                <div>
                    <button class="settings-item-btn edit" onclick="editDirection('${key}')">✏️</button>
                    <button class="settings-item-btn delete" onclick="deleteDirection('${key}')">🗑️</button>
                </div>
            </div>
        `,
      )
      .join("");
  }
}

// ==================== ЕКСПОРТ/ІМПОРТ НАЛАШТУВАНЬ ====================

function exportSettings() {
  const settings = {
    responsible: RESPONSIBLE_PERSONS,
    statuses: Object.keys(STATUSES).map((key) => ({
      id: STATUSES[key],
      name: STATUS_LABELS[STATUSES[key]],
    })),
    directions: Object.keys(DIRECTIONS).map((key) => ({
      id: key,
      name: DIRECTIONS[key],
    })),
  };

  const dataStr = JSON.stringify(settings, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `settings_export_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importSettings() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const settings = JSON.parse(text);

      if (settings.responsible) {
        RESPONSIBLE_PERSONS.length = 0;
        RESPONSIBLE_PERSONS.push(...settings.responsible);
      }

      // Тут можна додати імпорт статусів та напрямків

      saveSettings();
      updateResponsibleList();
      showNotification("Налаштування імпортовано", "success");
    } catch (error) {
      console.error("Помилка імпорту:", error);
      showNotification("Помилка імпорту", "error");
    }
  };

  input.click();
}

// ==================== СТИЛІ ДЛЯ НАЛАШТУВАНЬ ====================

function addSettingsStyles() {
  if (document.getElementById("settings-styles")) return;

  const style = document.createElement("style");
  style.id = "settings-styles";
  style.textContent = `
        .settings-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }

        .settings-modal {
            background: white;
            border-radius: 15px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        }

        .settings-modal-header {
            padding: 20px;
            border-bottom: 1px solid #e1e1e1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8f9fa;
            border-radius: 15px 15px 0 0;
        }

        .settings-modal-header h2 {
            margin: 0;
            color: #333;
        }

        .settings-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 0 10px;
        }

        .settings-modal-close:hover {
            color: #333;
        }

        .settings-modal-tabs {
            display: flex;
            gap: 5px;
            padding: 20px 20px 0;
            border-bottom: 1px solid #e1e1e1;
            background: #f8f9fa;
        }

        .settings-tab {
            padding: 10px 20px;
            border: none;
            background: none;
            cursor: pointer;
            font-weight: 600;
            color: #666;
            border-radius: 8px 8px 0 0;
            transition: all 0.3s;
        }

        .settings-tab:hover {
            background: #e9ecef;
            color: #333;
        }

        .settings-tab.active {
            background: white;
            color: #667eea;
            border: 1px solid #e1e1e1;
            border-bottom: 2px solid #667eea;
            margin-bottom: -1px;
        }

        .settings-modal-content {
            padding: 20px;
            max-height: 60vh;
            overflow-y: auto;
        }

        .settings-tab-content {
            display: none;
        }

        .settings-tab-content.active {
            display: block;
        }

        .settings-description {
            color: #666;
            margin-bottom: 20px;
            font-size: 0.9em;
        }

        .settings-items-list {
            margin-bottom: 20px;
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #e1e1e1;
            border-radius: 8px;
        }

        .settings-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            border-bottom: 1px solid #e1e1e1;
            background: white;
        }

        .settings-item:last-child {
            border-bottom: none;
        }

        .settings-item:hover {
            background: #f8f9fa;
        }

        .settings-item-btn {
            padding: 5px 10px;
            margin: 0 2px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .settings-item-btn.edit {
            background: #4299e1;
            color: white;
        }

        .settings-item-btn.edit:hover {
            background: #3182ce;
        }

        .settings-item-btn.delete {
            background: #f56565;
            color: white;
        }

        .settings-item-btn.delete:hover {
            background: #e53e3e;
        }

        .settings-add-form {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .settings-add-form input {
            flex: 1;
            padding: 10px;
            border: 2px solid #e1e1e1;
            border-radius: 8px;
            font-size: 14px;
        }

        .settings-add-form input[type="color"] {
            flex: 0 0 60px;
            padding: 5px;
            height: 42px;
        }

        .settings-add-form button {
            padding: 10px 20px;
            background: #48bb78;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            white-space: nowrap;
        }

        .settings-add-form button:hover {
            background: #38a169;
        }

        .settings-import-export {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .settings-export-btn, .settings-import-btn, .settings-reset-btn {
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            flex: 1;
            min-width: 150px;
            transition: all 0.3s;
        }

        .settings-export-btn {
            background: #48bb78;
            color: white;
        }

        .settings-import-btn {
            background: #4299e1;
            color: white;
        }

        .settings-reset-btn {
            background: #ed8936;
            color: white;
        }

        .settings-export-btn:hover, .settings-import-btn:hover, .settings-reset-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .settings-modal-footer {
            padding: 20px;
            border-top: 1px solid #e1e1e1;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            background: #f8f9fa;
            border-radius: 0 0 15px 15px;
        }

        .settings-save-btn {
            padding: 12px 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }

        .settings-save-btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .settings-cancel-btn {
            padding: 12px 30px;
            background: #a0aec0;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }

        .settings-cancel-btn:hover {
            background: #718096;
        }

        .status-badge-preview {
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.9em;
        }

        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .settings-icon {
            cursor: pointer;
            font-size: 24px;
            padding: 8px;
            border-radius: 50%;
            transition: all 0.3s;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .settings-icon:hover {
            transform: rotate(90deg) scale(1.1);
            background: #667eea;
            color: white;
        }
    `;

  document.head.appendChild(style);
}

// ==================== ІНІЦІАЛІЗАЦІЯ ====================

// Додаємо іконку налаштувань в інтерфейс
function addSettingsIcon() {
  const container = document.querySelector(".container h1");
  if (!container) return;

  const settingsIcon = document.createElement("span");
  settingsIcon.className = "settings-icon";
  settingsIcon.innerHTML = "⚙️";
  settingsIcon.style.cssText = `
        float: right;
        cursor: pointer;
        font-size: 32px;
        margin-left: 20px;
        transition: transform 0.3s;
    `;
  settingsIcon.onclick = openSettingsModal;
  settingsIcon.title = "Налаштування";

  container.appendChild(settingsIcon);

  // Додаємо стилі
  addSettingsStyles();

  // Завантажуємо збережені налаштування
  loadSettings();
}

// Викликаємо при завантаженні
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(addSettingsIcon, 500);
});

// Робимо функції глобальними
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.switchSettingsTab = switchSettingsTab;
window.addResponsible = addResponsible;
window.editResponsible = editResponsible;
window.deleteResponsible = deleteResponsible;
window.addStatus = addStatus;
window.editStatus = editStatus;
window.deleteStatus = deleteStatus;
window.addDirection = addDirection;
window.editDirection = editDirection;
window.deleteDirection = deleteDirection;
window.exportSettings = exportSettings;
window.importSettings = importSettings;
window.resetToDefault = resetToDefault;
window.saveSettingsAndClose = saveSettingsAndClose;
