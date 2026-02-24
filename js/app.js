// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================

let currentEditId = null;
let allRecords = [];

// ==================== ФУНКЦІЇ ВІДОБРАЖЕННЯ ====================

// Завантаження всіх даних
async function loadData() {
  try {
    allRecords = await DB.service.getAll();
    renderTable(allRecords);
    updateStats();
  } catch (error) {
    console.error("Помилка завантаження даних:", error);
  }
}

// Відображення таблиці
function renderTable(records) {
  const tbody = document.getElementById("tableBody");

  if (records.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="11" style="text-align: center;">Немає даних для відображення</td></tr>';
    return;
  }

  let html = "";
  records.forEach((row, index) => {
    html += createRowHtml(row, index + 1);
  });

  tbody.innerHTML = html;
}

// Створення HTML рядка таблиці
function createRowHtml(row, index) {
  const statusClass = STATUS_CLASSES[row.status] || "status-pending";
  const statusText = STATUS_LABELS[row.status] || "Очікує";

  // Форматування дат
  const orderDate = new Date(row.orderDate).toLocaleDateString("uk-UA");
  const deadline = new Date(row.deadline).toLocaleDateString("uk-UA");

  // Перевірка на прострочений термін
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = row.deadline < today && row.status !== STATUSES.COMPLETED;

  // Відображення напрямку (якщо "Інше", показуємо що саме)
  let direction = row.direction;
  if (row.direction === DIRECTIONS.OTHER && row.customDirection) {
    direction = `${DIRECTIONS.OTHER}: ${row.customDirection}`;
  }

  return `
        <tr id="row-${row.id}" ${isOverdue ? 'style="background-color: #fff5f5;"' : ""}>
            <td>${index}</td>
            <td title="${row.orderName}">${row.orderName}</td>
            <td>${row.orderNumber}</td>
            <td>${orderDate}</td>
            <td title="${row.measures}">${row.measures}</td>
            <td>${row.periodicity || "Не вказано"}</td>
            <td>${deadline} ${isOverdue ? "⚠️" : ""}</td>
            <td>${row.responsible}</td>
            <td>${direction}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-edit" onclick="editRecord(${row.id})">✏️</button>
                <button class="btn-delete" onclick="deleteRecord(${row.id})">🗑️</button>
            </td>
        </tr>
    `;
}

// Оновлення статистики
async function updateStats() {
  const stats = await DB.service.getStats();

  // Блок статусів
  document.getElementById("statsStatus").innerHTML = `
        <span class="stat-item" onclick="filterByStat('all')">${STATS_ICONS.total} Всього: ${stats.total}</span>
        <span class="stat-item" onclick="filterByStat('completed')">${STATS_ICONS.completed} Виконано: ${stats.completed}</span>
        <span class="stat-item" onclick="filterByStat('in-progress')">${STATS_ICONS.inProgress} В роботі: ${stats.inProgress}</span>
        <span class="stat-item" onclick="filterByStat('pending')">${STATS_ICONS.pending} Очікує: ${stats.pending}</span>
        <span class="stat-item overdue-item" onclick="filterByStat('overdue')">${STATS_ICONS.overdue} Прострочено: ${stats.overdue}</span>
        <button class="reset-filter-btn" onclick="resetFilters()">🔄 Скинути фільтри</button>
    `;

  // Блок напрямків
  document.getElementById("statsDirection").innerHTML = `
        <span class="stat-item" onclick="filterByStat('direction', '${DIRECTIONS.SERVICE}')">${STATS_ICONS.service} Служба: ${stats.service}</span>
        <span class="stat-item" onclick="filterByStat('direction', '${DIRECTIONS.CHEMISTRY}')">${STATS_ICONS.chemistry} Хімія: ${stats.chemistry}</span>
        <span class="stat-item" onclick="filterByStat('direction', '${DIRECTIONS.PYRO}')">${STATS_ICONS.pyro} Піро: ${stats.pyro}</span>
        <span class="stat-item" onclick="filterByStat('direction', '${DIRECTIONS.OTHER}')">${STATS_ICONS.other} Інше: ${stats.other}</span>
        <span style="flex: 1;"></span>
        <span class="stat-item" style="background: rgba(255,255,255,0.1); cursor: default;">
            🏷️ Всього напрямків: ${stats.service + stats.chemistry + stats.pyro + stats.other}
        </span>
    `;
}

// ==================== CRUD ОПЕРАЦІЇ ====================

// Додавання запису
async function addRecord() {
  const orderName = document.getElementById("orderName").value;
  const orderNumber = document.getElementById("orderNumber").value;
  const orderDate = document.getElementById("orderDate").value;
  const measures = document.getElementById("measures").value;
  const periodicity = document.getElementById("periodicity").value;
  const deadline = document.getElementById("deadline").value;
  const responsible = document.getElementById("responsible").value;
  const direction = document.getElementById("direction").value;
  const otherDirection = document.getElementById("otherDirection").value;
  const status = document.getElementById("status").value;

  if (
    !orderName ||
    !orderNumber ||
    !orderDate ||
    !measures ||
    !periodicity ||
    !deadline ||
    !responsible ||
    !direction
  ) {
    alert("Будь ласка, заповніть всі поля!");
    return;
  }

  try {
    const recordData = {
      orderName,
      orderNumber,
      orderDate,
      measures,
      periodicity,
      deadline,
      responsible,
      direction: direction === DIRECTIONS.OTHER ? DIRECTIONS.OTHER : direction,
      status,
    };

    if (direction === DIRECTIONS.OTHER && otherDirection) {
      recordData.customDirection = otherDirection;
    }

    if (currentEditId) {
      await DB.service.update(currentEditId, recordData);
      currentEditId = null;
      document.getElementById("submitBtn").textContent = "Додати запис";
      document.getElementById("cancelBtn").style.display = "none";
    } else {
      await DB.service.add(recordData);
    }

    clearForm();
    await loadData();
  } catch (error) {
    console.error("Помилка при збереженні:", error);
    alert("Помилка при збереженні даних");
  }
}

// Редагування запису
async function editRecord(id) {
  try {
    const record = await DB.service.getById(id);

    if (record) {
      document.getElementById("orderName").value = record.orderName || "";
      document.getElementById("orderNumber").value = record.orderNumber || "";
      document.getElementById("orderDate").value = record.orderDate || "";
      document.getElementById("measures").value = record.measures || "";
      document.getElementById("periodicity").value = record.periodicity || "";
      document.getElementById("deadline").value = record.deadline || "";
      document.getElementById("responsible").value = record.responsible || "";

      const directionSelect = document.getElementById("direction");
      const otherGroup = document.getElementById("otherDirectionGroup");
      const otherInput = document.getElementById("otherDirection");

      if (record.direction === DIRECTIONS.OTHER && record.customDirection) {
        directionSelect.value = DIRECTIONS.OTHER;
        otherGroup.style.display = "block";
        otherInput.value = record.customDirection || "";
      } else {
        directionSelect.value = record.direction || "";
        otherGroup.style.display = "none";
        otherInput.value = "";
      }

      document.getElementById("status").value =
        record.status || STATUSES.PENDING;

      currentEditId = id;
      document.getElementById("submitBtn").textContent = "Оновити запис";
      document.getElementById("cancelBtn").style.display = "inline-block";
    }
  } catch (error) {
    console.error("Помилка при редагуванні:", error);
  }
}

// Видалення запису
async function deleteRecord(id) {
  if (confirm("Ви впевнені, що хочете видалити цей запис?")) {
    try {
      await DB.service.delete(id);
      await loadData();

      if (currentEditId === id) {
        cancelEdit();
      }
    } catch (error) {
      console.error("Помилка при видаленні:", error);
      alert("Помилка при видаленні запису");
    }
  }
}

// Скасування редагування
function cancelEdit() {
  currentEditId = null;
  clearForm();
  document.getElementById("submitBtn").textContent = "Додати запис";
  document.getElementById("cancelBtn").style.display = "none";
}

// Очищення форми
function clearForm() {
  document.getElementById("orderName").value = "";
  document.getElementById("orderNumber").value = "";
  document.getElementById("orderDate").value = "";
  document.getElementById("measures").value = "";
  document.getElementById("periodicity").value = "";
  document.getElementById("deadline").value = "";
  document.getElementById("responsible").value = "";
  document.getElementById("direction").value = "";
  document.getElementById("otherDirectionGroup").style.display = "none";
  document.getElementById("otherDirection").value = "";
  document.getElementById("status").value = STATUSES.PENDING;
}

// ==================== ФІЛЬТРАЦІЯ ====================

// Фільтрація таблиці
async function filterTable() {
  const searchTerm = document.getElementById("searchInput").value;
  const statusFilter = document.getElementById("statusFilter").value;

  try {
    let filtered = allRecords;

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (searchTerm) {
      filtered = await DB.service.search(searchTerm);
      if (statusFilter !== "all") {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }
    }

    renderTable(filtered);
    highlightActiveFilter("all");
  } catch (error) {
    console.error("Помилка при фільтрації:", error);
  }
}

// Фільтрація за кліком на статистику
async function filterByStat(type, value = null) {
  try {
    let filtered = allRecords;
    const today = new Date().toISOString().split("T")[0];

    document.getElementById("searchInput").value = "";
    document.getElementById("statusFilter").value = "all";

    switch (type) {
      case "all":
        filtered = allRecords;
        break;
      case "completed":
        filtered = allRecords.filter((r) => r.status === STATUSES.COMPLETED);
        break;
      case "in-progress":
        filtered = allRecords.filter((r) => r.status === STATUSES.IN_PROGRESS);
        break;
      case "pending":
        filtered = allRecords.filter((r) => r.status === STATUSES.PENDING);
        break;
      case "overdue":
        filtered = allRecords.filter(
          (r) => r.deadline < today && r.status !== STATUSES.COMPLETED,
        );
        break;
      case "direction":
        if (value === DIRECTIONS.OTHER) {
          filtered = allRecords.filter(
            (r) =>
              r.direction === DIRECTIONS.OTHER ||
              (r.direction && !isStandardDirection(r.direction)),
          );
        } else {
          filtered = allRecords.filter((r) => r.direction === value);
        }
        break;
    }

    renderTable(filtered);
    highlightActiveFilter(type, value);
  } catch (error) {
    console.error("Помилка при фільтрації:", error);
  }
}

// Підсвічування активного фільтра
function highlightActiveFilter(type, value) {
  document.querySelectorAll(".stat-item").forEach((item) => {
    item.classList.remove("active-filter");
  });

  setTimeout(() => {
    const statsStatus = document.getElementById("statsStatus");
    const statsDirection = document.getElementById("statsDirection");

    if (!statsStatus || !statsDirection) return;

    const statusItems = statsStatus.querySelectorAll(".stat-item");
    const directionItems = statsDirection.querySelectorAll(".stat-item");

    const indexMap = {
      all: 0,
      completed: 1,
      "in-progress": 2,
      pending: 3,
      overdue: 4,
    };

    const directionMap = {
      [DIRECTIONS.SERVICE]: 0,
      [DIRECTIONS.CHEMISTRY]: 1,
      [DIRECTIONS.PYRO]: 2,
      [DIRECTIONS.OTHER]: 3,
    };

    if (type === "all" && statusItems[0]) {
      statusItems[0].classList.add("active-filter");
    } else if (indexMap[type] !== undefined && statusItems[indexMap[type]]) {
      statusItems[indexMap[type]].classList.add("active-filter");
    } else if (
      type === "direction" &&
      value &&
      directionMap[value] !== undefined
    ) {
      const idx = directionMap[value];
      if (directionItems[idx]) {
        directionItems[idx].classList.add("active-filter");
      }
    }
  }, 10);
}

// Скидання фільтрів
function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("statusFilter").value = "all";
  renderTable(allRecords);
  highlightActiveFilter("all");
}

// ==================== ІНІЦІАЛІЗАЦІЯ ====================

// Налаштування обробника для поля "Інше"
function setupDirectionHandler() {
  const directionSelect = document.getElementById("direction");
  const otherGroup = document.getElementById("otherDirectionGroup");
  const otherInput = document.getElementById("otherDirection");

  directionSelect.addEventListener("change", function () {
    if (this.value === DIRECTIONS.OTHER) {
      otherGroup.style.display = "block";
      otherInput.required = true;
    } else {
      otherGroup.style.display = "none";
      otherInput.required = false;
      otherInput.value = "";
    }
  });
}

// Заповнення випадаючих списків
function populateSelects() {
  // Періодичність
  const periodicitySelect = document.getElementById("periodicity");
  periodicitySelect.innerHTML =
    '<option value="">Оберіть періодичність</option>' +
    PERIODICITY_OPTIONS.map(
      (p) => `<option value="${p.value}">${p.label}</option>`,
    ).join("");

  // Напрямки
  const directionSelect = document.getElementById("direction");
  directionSelect.innerHTML =
    '<option value="">Оберіть напрямок</option>' +
    Object.values(DIRECTIONS)
      .map((d) => `<option value="${d}">${d}</option>`)
      .join("");

  // Відповідальні особи
  const responsibleSelect = document.getElementById("responsible");
  responsibleSelect.innerHTML =
    '<option value="">Оберіть відповідального</option>' +
    RESPONSIBLE_PERSONS.map(
      (person) => `<option value="${person}">${person}</option>`,
    ).join("");
}

// Ініціалізація програми
async function initApp() {
  try {
    // Додаємо тестові дані якщо потрібно
    await TestData.addIfNeeded(DB.instance);

    // Завантажуємо дані
    await loadData();

    // Налаштовуємо обробники
    setupDirectionHandler();

    // Заповнюємо випадаючі списки
    populateSelects();
  } catch (error) {
    console.error("Помилка ініціалізації:", error);
    document.getElementById("tableBody").innerHTML =
      '<tr><td colspan="11" style="text-align: center; color: red;">Помилка завантаження бази даних</td></tr>';
  }
}

// ==================== DOM READY ====================

document.addEventListener("DOMContentLoaded", () => {
  initApp();

  // Enter в полях
  const inputs = document.querySelectorAll("input, textarea, select");
  inputs.forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addRecord();
      }
    });
  });
});

// Глобальні функції
window.addRecord = addRecord;
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.cancelEdit = cancelEdit;
window.filterTable = filterTable;
window.filterByStat = filterByStat;
window.resetFilters = resetFilters;
