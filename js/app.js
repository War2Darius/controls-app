// ==================== ГЛОБАЛЬНІ ЗМІННІ ====================

let currentEditId = null;
let allRecords = [];
let currentPdfBlob = null;
let currentPdfName = null;

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
      '<tr><td colspan="12" style="text-align: center; padding: 30px;">Немає даних для відображення</td></tr>';
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
  const statusLabels = window.getStatusLabels();
  const statusKeys = window.getStatusKeys();
  const statusClassMap = {
    [statusKeys[0]]: "status-pending",
    [statusKeys[1]]: "status-in-progress",
    [statusKeys[2]]: "status-completed",
  };
  const statusClass = statusClassMap[row.status] || "status-pending";
  const statusText = statusLabels[row.status] || "Очікує";

  // Форматування дат
  const orderDate = new Date(row.orderDate).toLocaleDateString("uk-UA");
  const deadline = new Date(row.deadline).toLocaleDateString("uk-UA");

  // Перевірка на прострочений термін
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = row.deadline < today && row.status !== window.STATUSES.COMPLETED;

  // Відображення напрямку (якщо "Інше", показуємо що саме)
  let direction = row.direction;
  const directions = getDirections();
  if (direction === "Інше" && row.customDirection) {
    direction = `Інше: ${row.customDirection}`;
  }

  const pdfIcon = row.pdfBlob
    ? `<span class="pdf-icon" onclick="openPdf(${row.id})" title="Відкрити PDF">📄</span>`
    : `<span class="pdf-icon pdf-icon-empty" title="PDF не прикріплено">📄</span>`;

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
            <td>${pdfIcon}</td>
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
  const directions = getDirections();

  // Блок статусів
  document.getElementById("statsStatus").innerHTML = `
        <span class="stat-item" onclick="filterByStat('all')">${STATS_ICONS.total} Всього: ${stats.total}</span>
        <span class="stat-item" onclick="filterByStat('completed')">${STATS_ICONS.completed} Виконано: ${stats.completed}</span>
        <span class="stat-item" onclick="filterByStat('in-progress')">${STATS_ICONS.inProgress} В роботі: ${stats.inProgress}</span>
        <span class="stat-item" onclick="filterByStat('pending')">${STATS_ICONS.pending} Очікує: ${stats.pending}</span>
        <span class="stat-item overdue-item" onclick="filterByStat('overdue')">${STATS_ICONS.overdue} Прострочено: ${stats.overdue}</span>
        <button class="reset-filter-btn" onclick="resetFilters()">🔄 Скинути фільтри</button>
    `;

  // Блок напрямків - динамічний
  let directionsHtml = "";
  const icons = [STATS_ICONS.service, STATS_ICONS.chemistry, STATS_ICONS.pyro, STATS_ICONS.other];
  const statsValues = [stats.service, stats.chemistry, stats.pyro, stats.other];
  
  directions.forEach((dir, index) => {
    const icon = icons[index] || STATS_ICONS.other;
    const count = statsValues[index] || 0;
    directionsHtml += `<span class="stat-item" onclick="filterByStat('direction', '${dir}')">${icon} ${dir}: ${count}</span>`;
  });

  document.getElementById("statsDirection").innerHTML = `
        ${directionsHtml}
        <span style="flex: 1;"></span>
        <span class="stat-item" style="background: rgba(255,255,255,0.1); cursor: default;">
            🏷️ Всього напрямків: ${Object.values(stats).reduce((a, b) => a + b, 0) - stats.total}
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
    const directions = getDirections();
    const recordData = {
      orderName,
      orderNumber,
      orderDate,
      measures,
      periodicity,
      deadline,
      responsible,
      direction: direction,
      status,
    };

    // Якщо вибрано "Інше" і введено свій напрямок
    if (direction === "Інше" && otherDirection) {
      recordData.customDirection = otherDirection;
    }

    if (currentPdfBlob) {
      recordData.pdfBlob = currentPdfBlob;
      recordData.pdfName = currentPdfName;
    }

    if (currentEditId) {
      const existingRecord = await DB.service.getById(currentEditId);
      if (currentPdfBlob) {
        recordData.pdfBlob = currentPdfBlob;
        recordData.pdfName = currentPdfName;
      } else if (existingRecord && existingRecord.pdfBlob) {
        recordData.pdfBlob = existingRecord.pdfBlob;
        recordData.pdfName = existingRecord.pdfName;
      }
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

      if (record.direction === "Інше" && record.customDirection) {
        directionSelect.value = "Інше";
        otherGroup.style.display = "block";
        otherInput.value = record.customDirection || "";
      } else {
        directionSelect.value = record.direction || "";
        otherGroup.style.display = "none";
        otherInput.value = "";
      }

      document.getElementById("status").value =
        record.status || window.STATUSES.PENDING;

      if (record.pdfName) {
        document.getElementById("pdfFileName").textContent = record.pdfName;
        document.getElementById("pdfFileName").style.display = "inline";
        document.getElementById("clearPdfBtn").style.display = "inline-block";
      }

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
  document.getElementById("status").value = window.STATUSES.PENDING;
  clearPdfFile();
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
    const directions = getDirections();

    document.getElementById("searchInput").value = "";
    document.getElementById("statusFilter").value = "all";

    switch (type) {
      case "all":
        filtered = allRecords;
        break;
      case "completed":
        filtered = allRecords.filter((r) => r.status === window.STATUSES.COMPLETED);
        break;
      case "in-progress":
        filtered = allRecords.filter((r) => r.status === window.STATUSES.IN_PROGRESS);
        break;
      case "pending":
        filtered = allRecords.filter((r) => r.status === window.STATUSES.PENDING);
        break;
      case "overdue":
        filtered = allRecords.filter(
          (r) => r.deadline < today && r.status !== window.STATUSES.COMPLETED,
        );
        break;
      case "direction":
        filtered = allRecords.filter((r) => r.direction === value);
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

    if (type === "all" && statusItems[0]) {
      statusItems[0].classList.add("active-filter");
    } else if (indexMap[type] !== undefined && statusItems[indexMap[type]]) {
      statusItems[indexMap[type]].classList.add("active-filter");
    } else if (type === "direction" && value) {
      // Знаходимо індекс напрямку
      const directions = getDirections();
      const dirIndex = directions.indexOf(value);
      if (dirIndex !== -1 && directionItems[dirIndex]) {
        directionItems[dirIndex].classList.add("active-filter");
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
    const directions = getDirections();
    if (this.value === directions[3] || this.value === "Інше") {
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
  updatePeriodicitySelect();
  updateDirectionSelect();
  updateResponsibleSelect();
  updateStatusSelect();
  updateStatusFilter();
}

function updatePeriodicitySelect() {
  const periodicitySelect = document.getElementById("periodicity");
  const options = window.getPeriodicityOptions();
  periodicitySelect.innerHTML =
    '<option value="">Оберіть періодичність</option>' +
    options.map(
      (p) => `<option value="${p.value}">${p.label}</option>`,
    ).join("");
}

function updateDirectionSelect() {
  const directionSelect = document.getElementById("direction");
  directionSelect.innerHTML =
    '<option value="">Оберіть напрямок</option>' +
    getDirections()
      .map((d) => `<option value="${d}">${d}</option>`)
      .join("");
}

function updateResponsibleSelect() {
  const responsibleSelect = document.getElementById("responsible");
  responsibleSelect.innerHTML =
    '<option value="">Оберіть відповідального</option>' +
    getResponsiblePersons()
      .map((person) => `<option value="${person}">${person}</option>`)
      .join("");
}

function updateStatusSelect() {
  const statusSelect = document.getElementById("status");
  const labels = window.getStatusLabels();
  statusSelect.innerHTML = Object.entries(labels)
    .map(
      ([key, label]) => `<option value="${key}">${label}</option>`,
    )
    .join("");
}

function updateStatusFilter() {
  const statusFilter = document.getElementById("statusFilter");
  const labels = window.getStatusLabels();
  statusFilter.innerHTML =
    '<option value="all">📋 Всі записи</option>' +
    Object.entries(labels)
      .map(
        ([key, label]) => `<option value="${key}">${label}</option>`,
      )
      .join("");
}

function refreshMainPage() {
  loadData();
}

// Ініціалізація програми
async function initApp() {
  try {
    // Додаємо тестові дані якщо потрібно
    // await TestData.addIfNeeded(DB.instance);

    // Завантажуємо дані
    await loadData();

    // Налаштовуємо обробники
    setupDirectionHandler();

    // Налаштовуємо обробник PDF
    setupPdfHandler();

    // Заповнюємо випадаючі списки
    populateSelects();
  } catch (error) {
    console.error("Помилка ініціалізації:", error);
    document.getElementById("tableBody").innerHTML =
      '<tr><td colspan="12" style="text-align: center; color: red; padding: 30px;">Помилка завантаження бази даних</td></tr>';
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

// ==================== PDF ФУНКЦІЇ ====================

function setupPdfHandler() {
  const pdfInput = document.getElementById("pdfInput");
  const pdfFileName = document.getElementById("pdfFileName");
  const clearPdfBtn = document.getElementById("clearPdfBtn");

  pdfInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Будь ласка, виберіть файл у форматі PDF!");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = function (event) {
        currentPdfBlob = event.target.result;
        currentPdfName = file.name;
        pdfFileName.textContent = file.name;
        pdfFileName.style.display = "inline";
        clearPdfBtn.style.display = "inline-block";
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

function clearPdfFile() {
  currentPdfBlob = null;
  currentPdfName = null;
  document.getElementById("pdfInput").value = "";
  document.getElementById("pdfFileName").textContent = "";
  document.getElementById("pdfFileName").style.display = "none";
  document.getElementById("clearPdfBtn").style.display = "none";
}

async function openPdf(id) {
  try {
    const record = await DB.service.getById(id);
    if (record && record.pdfBlob) {
      const blob = new Blob([record.pdfBlob], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } else {
      alert("PDF документ не знайдено!");
    }
  } catch (error) {
    console.error("Помилка відкриття PDF:", error);
    alert("Помилка при відкритті PDF");
  }
}

// Глобальні функції
window.addRecord = addRecord;
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.cancelEdit = cancelEdit;
window.filterTable = filterTable;
window.filterByStat = filterByStat;
window.resetFilters = resetFilters;
window.clearPdfFile = clearPdfFile;
window.openPdf = openPdf;
window.updatePeriodicitySelect = updatePeriodicitySelect;
window.updateStatusSelect = updateStatusSelect;
window.updateStatusFilter = updateStatusFilter;
window.refreshMainPage = refreshMainPage;
window.updateDirectionSelect = updateDirectionSelect;
window.updateResponsibleSelect = updateResponsibleSelect;
