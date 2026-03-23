// ==================== НАЛАШТУВАННЯ ====================

function openSettings() {
  document.getElementById("settingsModal").style.display = "flex";
  renderResponsibleList();
  renderDirectionsList();
  renderPeriodicityList();
  renderStatusList();
}

function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
  document.getElementById("newResponsibleName").value = "";
  document.getElementById("newDirectionName").value = "";
  document.getElementById("newPeriodicityLabel").value = "";
}

// ==================== ВІДПОВІДАЛЬНІ ====================

function renderResponsibleList() {
  const list = document.getElementById("responsibleList");
  const persons = getResponsiblePersons();
  
  list.innerHTML = persons
    .map(
      (person) => `
      <li>
        <span>${person}</span>
        <button class="btn-remove-person" onclick="removeResponsible('${person}')">✕</button>
      </li>
    `
    )
    .join("");
}

function addNewResponsible() {
  const input = document.getElementById("newResponsibleName");
  const name = input.value.trim();
  
  if (name) {
    addResponsiblePerson(name);
    input.value = "";
    renderResponsibleList();
    window.updateResponsibleSelect();
    window.refreshMainPage();
  }
}

function removeResponsible(name) {
  if (confirm(`Видалити "${name}" зі списку відповідальних?`)) {
    removeResponsiblePerson(name);
    renderResponsibleList();
    window.updateResponsibleSelect();
    window.refreshMainPage();
  }
}

// ==================== НАПРЯМКИ ====================

function renderDirectionsList() {
  const list = document.getElementById("directionsList");
  const directions = getDirections();
  
  list.innerHTML = directions
    .map(
      (direction, index) => `
      <li>
        <span class="direction-name" id="direction-${index}">${direction}</span>
        <div class="direction-actions">
          <button class="btn-edit-direction" onclick="startEditDirection(${index})" title="Редагувати">✏️</button>
          <button class="btn-remove-person" onclick="removeDirection('${direction}')">✕</button>
        </div>
      </li>
    `
    )
    .join("");
}

function addNewDirection() {
  const input = document.getElementById("newDirectionName");
  const name = input.value.trim();
  
  if (name) {
    window.addDirection(name);
    input.value = "";
    renderDirectionsList();
    window.updateDirectionSelect();
    window.refreshMainPage();
  }
}

function removeDirection(name) {
  if (confirm(`Видалити напрямок "${name}"?`)) {
    window.removeDirectionFromList(name);
    renderDirectionsList();
    window.updateDirectionSelect();
    window.refreshMainPage();
  }
}

function startEditDirection(index) {
  const directions = getDirections();
  const currentName = directions[index];
  const newName = prompt(`Введіть нову назву для "${currentName}":`, currentName);
  
  if (newName && newName.trim() && newName.trim() !== currentName) {
    window.updateDirection(currentName, newName.trim());
    renderDirectionsList();
    window.updateDirectionSelect();
    window.refreshMainPage();
  }
}

// ==================== ПЕРІОДИЧНІСТЬ ====================

function renderPeriodicityList() {
  const list = document.getElementById("periodicityList");
  const options = getPeriodicityOptions();
  
  list.innerHTML = options
    .map(
      (opt, index) => `
      <li>
        <span>${opt.label}</span>
        <div class="direction-actions">
          <button class="btn-edit-direction" onclick="startEditPeriodicity(${index})" title="Редагувати">✏️</button>
          <button class="btn-remove-person" onclick="removePeriodicity('${opt.value}')">✕</button>
        </div>
      </li>
    `
    )
    .join("");
}

function addNewPeriodicity() {
  const labelInput = document.getElementById("newPeriodicityLabel");
  const label = labelInput.value.trim();
  
  if (label) {
    window.addPeriodicityOption(label);
    labelInput.value = "";
    renderPeriodicityList();
    window.updatePeriodicitySelect();
    window.refreshMainPage();
  }
}

function removePeriodicity(value) {
  if (confirm(`Видалити періодичність "${value}"?`)) {
    window.removePeriodicityOption(value);
    renderPeriodicityList();
    window.updatePeriodicitySelect();
    window.refreshMainPage();
  }
}

function startEditPeriodicity(index) {
  const options = getPeriodicityOptions();
  const current = options[index];
  const newLabel = prompt(`Введіть нову назву для "${current.label}":`, current.label);
  
  if (newLabel && newLabel.trim() && newLabel.trim() !== current.label) {
    window.updatePeriodicityOption(current.value, current.value, newLabel.trim());
    renderPeriodicityList();
    window.updatePeriodicitySelect();
    window.refreshMainPage();
  }
}

// ==================== СТАТУСИ ====================

function renderStatusList() {
  const list = document.getElementById("statusList");
  const labels = getStatusLabels();
  
  list.innerHTML = Object.entries(labels)
    .map(
      ([key, label]) => `
      <li>
        <span><strong>${label}</strong></span>
        <div class="direction-actions">
          <button class="btn-edit-direction" onclick="startEditStatus('${key}')" title="Редагувати">✏️</button>
        </div>
      </li>
    `
    )
    .join("");
}

function startEditStatus(key) {
  const labels = getStatusLabels();
  const currentLabel = labels[key];
  const newLabel = prompt(`Введіть нову назву для статусу "${key}":`, currentLabel);
  
  if (newLabel && newLabel.trim() && newLabel.trim() !== currentLabel) {
    window.updateStatusLabel(key, newLabel.trim());
    renderStatusList();
    window.updateStatusSelect();
    window.updateStatusFilter();
    window.refreshMainPage();
  }
}

// Закриття модального вікна при кліку поза ним
document.addEventListener("click", function (e) {
  const modal = document.getElementById("settingsModal");
  if (e.target === modal) {
    closeSettings();
  }
});

// Глобальні функції
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.addNewResponsible = addNewResponsible;
window.removeResponsible = removeResponsible;
window.renderResponsibleList = renderResponsibleList;
window.renderDirectionsList = renderDirectionsList;
window.addNewDirection = addNewDirection;
window.removeDirection = removeDirection;
window.startEditDirection = startEditDirection;
window.addNewPeriodicity = addNewPeriodicity;
window.removePeriodicity = removePeriodicity;
window.startEditPeriodicity = startEditPeriodicity;
window.startEditStatus = startEditStatus;
