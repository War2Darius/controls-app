// ==================== НАЛАШТУВАННЯ З ВКЛАДКАМИ ====================

// Відкрити налаштування
function openSettings() {
  const modal = document.getElementById("settingsModal");
  if (modal) {
    modal.style.display = "flex";
    // Оновлюємо всі списки
    renderResponsibleList();
    renderDirectionsList();
    renderPeriodicityList();
    renderStatusList();
  }
}

// Закрити налаштування
function closeSettings() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.style.display = "none";
  // Очищаємо поля
  const inputs = [
    "newResponsibleName",
    "newDirectionName",
    "newPeriodicityLabel",
  ];
  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// Перемикання вкладок
function switchTab(tabId) {
  // Ховаємо всі вкладки
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.remove("active");
  });
  // Знімаємо активний клас з усіх кнопок
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  // Показуємо вибрану вкладку
  const activePane = document.getElementById(tabId);
  if (activePane) activePane.classList.add("active");
  // Активуємо кнопку
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

// ==================== ВІДПОВІДАЛЬНІ ====================
function renderResponsibleList() {
  const list = document.getElementById("responsibleList");
  const persons = getResponsiblePersons();
  if (!list) return;

  if (persons.length === 0) {
    list.innerHTML =
      '<li style="color: #999; text-align: center; padding: 20px;">Немає відповідальних осіб</li>';
    return;
  }

  list.innerHTML = persons
    .map(
      (person) => `
        <li>
            <span>${escapeHtml(person)}</span>
            <button class="btn-remove-person" onclick="removeResponsible('${escapeHtml(person).replace(/'/g, "\\'")}')" title="Видалити">✕</button>
        </li>
    `,
    )
    .join("");
}

function addNewResponsible() {
  const input = document.getElementById("newResponsibleName");
  const name = input.value.trim();
  if (!name) {
    showNotification("Введіть ПІБ працівника", "error");
    return;
  }
  addResponsiblePerson(name);
  input.value = "";
  renderResponsibleList();
  if (window.updateResponsibleSelect) window.updateResponsibleSelect();
  if (window.refreshMainPage) window.refreshMainPage();
  showNotification(`✅ Додано: ${name}`, "success");
}

function removeResponsible(name) {
  if (confirm(`Видалити "${name}" зі списку відповідальних?`)) {
    removeResponsiblePerson(name);
    renderResponsibleList();
    if (window.updateResponsibleSelect) window.updateResponsibleSelect();
    if (window.refreshMainPage) window.refreshMainPage();
    showNotification(`❌ Видалено: ${name}`, "info");
  }
}

// ==================== НАПРЯМКИ ====================
function renderDirectionsList() {
  const list = document.getElementById("directionsList");
  const directions = getDirections();
  if (!list) return;

  if (directions.length === 0) {
    list.innerHTML =
      '<li style="color: #999; text-align: center; padding: 20px;">Немає напрямків</li>';
    return;
  }

  list.innerHTML = directions
    .map(
      (direction, index) => `
        <li>
            <span>${escapeHtml(direction)}</span>
            <div class="direction-actions">
                <button class="btn-edit-direction" onclick="startEditDirection(${index})" title="Редагувати">✏️</button>
                <button class="btn-remove-person" onclick="removeDirection('${escapeHtml(direction).replace(/'/g, "\\'")}')" title="Видалити">✕</button>
            </div>
        </li>
    `,
    )
    .join("");
}

function addNewDirection() {
  const input = document.getElementById("newDirectionName");
  const name = input.value.trim();
  if (!name) {
    showNotification("Введіть назву напрямку", "error");
    return;
  }
  addDirection(name);
  input.value = "";
  renderDirectionsList();
  if (window.updateDirectionSelect) window.updateDirectionSelect();
  if (window.refreshMainPage) window.refreshMainPage();
  showNotification(`✅ Додано напрямок: ${name}`, "success");
}

function removeDirection(name) {
  if (confirm(`Видалити напрямок "${name}"?`)) {
    removeDirectionFromList(name);
    renderDirectionsList();
    if (window.updateDirectionSelect) window.updateDirectionSelect();
    if (window.refreshMainPage) window.refreshMainPage();
    showNotification(`❌ Видалено напрямок: ${name}`, "info");
  }
}

function startEditDirection(index) {
  const directions = getDirections();
  const currentName = directions[index];
  const newName = prompt(
    `Введіть нову назву для "${currentName}":`,
    currentName,
  );
  if (newName && newName.trim() && newName.trim() !== currentName) {
    updateDirection(currentName, newName.trim());
    renderDirectionsList();
    if (window.updateDirectionSelect) window.updateDirectionSelect();
    if (window.refreshMainPage) window.refreshMainPage();
    showNotification(
      `✏️ Оновлено: ${currentName} → ${newName.trim()}`,
      "success",
    );
  }
}

// ==================== ПЕРІОДИЧНІСТЬ ====================
function renderPeriodicityList() {
  const list = document.getElementById("periodicityList");
  const options = getPeriodicityOptions();
  if (!list) return;

  if (options.length === 0) {
    list.innerHTML =
      '<li style="color: #999; text-align: center; padding: 20px;">Немає періодичності</li>';
    return;
  }

  list.innerHTML = options
    .map(
      (opt, index) => `
        <li>
            <span>${escapeHtml(opt.label)}</span>
            <div class="direction-actions">
                <button class="btn-edit-direction" onclick="startEditPeriodicity(${index})" title="Редагувати">✏️</button>
                <button class="btn-remove-person" onclick="removePeriodicity('${opt.value}')" title="Видалити">✕</button>
            </div>
        </li>
    `,
    )
    .join("");
}

function addNewPeriodicity() {
  const input = document.getElementById("newPeriodicityLabel");
  const label = input.value.trim();
  if (!label) {
    showNotification("Введіть назву періодичності", "error");
    return;
  }
  addPeriodicityOption(label);
  input.value = "";
  renderPeriodicityList();
  if (window.updatePeriodicitySelect) window.updatePeriodicitySelect();
  if (window.refreshMainPage) window.refreshMainPage();
  showNotification(`✅ Додано: ${label}`, "success");
}

function removePeriodicity(value) {
  const options = getPeriodicityOptions();
  const option = options.find((o) => o.value === value);
  if (confirm(`Видалити періодичність "${option?.label}"?`)) {
    removePeriodicityOption(value);
    renderPeriodicityList();
    if (window.updatePeriodicitySelect) window.updatePeriodicitySelect();
    if (window.refreshMainPage) window.refreshMainPage();
    showNotification(`❌ Видалено: ${option?.label}`, "info");
  }
}

function startEditPeriodicity(index) {
  const options = getPeriodicityOptions();
  const current = options[index];
  const newLabel = prompt(
    `Введіть нову назву для "${current.label}":`,
    current.label,
  );
  if (newLabel && newLabel.trim() && newLabel.trim() !== current.label) {
    updatePeriodicityOption(current.value, current.value, newLabel.trim());
    renderPeriodicityList();
    if (window.updatePeriodicitySelect) window.updatePeriodicitySelect();
    if (window.refreshMainPage) window.refreshMainPage();
    showNotification(
      `✏️ Оновлено: ${current.label} → ${newLabel.trim()}`,
      "success",
    );
  }
}

// ==================== СТАТУСИ ====================
function renderStatusList() {
  const list = document.getElementById("statusList");
  const labels = getStatusLabels();
  if (!list) return;

  // Отримуємо відповідні іконки для статусів
  const statusIcons = {
    pending: "⏰",
    "in-progress": "⚙️",
    completed: "✅",
  };

  if (Object.keys(labels).length === 0) {
    list.innerHTML =
      '<li style="color: #999; text-align: center; padding: 20px;">Немає статусів</li>';
    return;
  }

  list.innerHTML = Object.entries(labels)
    .map(([key, label]) => {
      const icon = statusIcons[key] || "🏷️";
      return `
            <li>
                <span>
                    <span style="font-size: 1.2em; margin-right: 8px;">${icon}</span>
                    <strong style="font-size: 1.05em;">${escapeHtml(label)}</strong>
                </span>
                <div class="direction-actions">
                    <button class="btn-edit-direction" onclick="startEditStatus('${key}')" title="Редагувати назву">✏️</button>
                </div>
            </li>
        `;
    })
    .join("");
}

function startEditStatus(key) {
  const labels = getStatusLabels();
  const currentLabel = labels[key];
  const newLabel = prompt(
    `Введіть нову назву для статусу "${currentLabel}":`,
    currentLabel,
  );
  if (newLabel && newLabel.trim() && newLabel.trim() !== currentLabel) {
    updateStatusLabel(key, newLabel.trim());
    renderStatusList();
    if (window.updateStatusSelect) window.updateStatusSelect();
    if (window.updateStatusFilter) window.updateStatusFilter();
    if (window.refreshMainPage) window.refreshMainPage();
    showNotification(
      `✏️ Статус оновлено: ${currentLabel} → ${newLabel.trim()}`,
      "success",
    );
  }
}

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================
function showNotification(message, type = "info") {
  const oldNotification = document.querySelector(".settings-notification");
  if (oldNotification) oldNotification.remove();

  const notification = document.createElement("div");
  notification.className = `settings-notification settings-notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10002;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;

  if (type === "success") notification.style.background = "#48bb78";
  else if (type === "error") notification.style.background = "#f56565";
  else notification.style.background = "#4299e1";

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Закриття модального вікна при кліку поза ним
document.addEventListener("click", function (e) {
  const modal = document.getElementById("settingsModal");
  if (modal && e.target === modal) closeSettings();
});
// Закриття модального вікна по Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const modal = document.getElementById("settingsModal");
    if (modal && modal.style.display === "flex") {
      closeSettings();
    }
  }
});

// ==================== ГЛОБАЛЬНІ ФУНКЦІЇ ====================
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.switchTab = switchTab;
window.addNewResponsible = addNewResponsible;
window.removeResponsible = removeResponsible;
window.addNewDirection = addNewDirection;
window.removeDirection = removeDirection;
window.startEditDirection = startEditDirection;
window.addNewPeriodicity = addNewPeriodicity;
window.removePeriodicity = removePeriodicity;
window.startEditPeriodicity = startEditPeriodicity;
window.startEditStatus = startEditStatus;
