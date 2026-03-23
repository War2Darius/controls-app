// ==================== ЕКСПОРТ/ІМПОРТ ====================

// Експорт в JSON
async function exportToJSON() {
  try {
    const allRecords = await DB.service.getAll();
    const dataStr = JSON.stringify(allRecords, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `controls_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("Дані успішно експортовано в JSON", "success");
  } catch (error) {
    console.error("Помилка при експорті:", error);
    showNotification("Помилка при експорті даних", "error");
  }
}

// Імпорт з JSON
function importFromJSON() {
  document.getElementById("fileInput").click();
}

// Обробник імпорту JSON
async function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const importedData = JSON.parse(text);
    if (!Array.isArray(importedData)) {
      showNotification(
        "Невірний формат файлу. Очікується масив даних.",
        "error",
      );
      return;
    }
    const currentRecords = await DB.service.getAll();
    showImportModal(importedData, currentRecords);
  } catch (error) {
    console.error("Помилка при імпорті:", error);
    showNotification(
      "Помилка при імпорті даних. Перевірте формат файлу.",
      "error",
    );
  }
  event.target.value = "";
}

// Показати модальне вікно для імпорту
function showImportModal(importedData, currentRecords) {
  closeModal();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  const modal = document.createElement("div");
  modal.className = "modal";
  const currentCount = currentRecords.length;
  const newCount = importedData.length;
  const newRecords = importedData.filter(
    (imported) =>
      !currentRecords.some(
        (current) =>
          current.orderName === imported.orderName &&
          current.orderNumber === imported.orderNumber &&
          current.deadline === imported.deadline,
      ),
  );
  modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0;">📥 Імпорт даних</h3>
            <button onclick="closeModal()" style="background: none; border: none; font-size: 28px; cursor: pointer; padding: 0; color: #999;">&times;</button>
        </div>
        <div>
            <p><strong>Поточних записів:</strong> ${currentCount}</p>
            <p><strong>В імпортованому файлі:</strong> ${newCount}</p>
            <p><strong>Нових записів знайдено:</strong> ${newRecords.length}</p>
        </div>
        <hr style="margin: 15px 0;">
        <div class="import-options">
            <label>
                <div><input type="radio" name="importMode" value="replace" checked> <strong>🔁 Замінити всі дані</strong></div>
                <small>Поточні дані будуть видалені</small>
            </label>
            <label>
                <div><input type="radio" name="importMode" value="merge"> <strong>🔄 Об'єднати з поточними</strong></div>
                <small>Додати тільки нові записи (за назвою + номером)</small>
            </label>
            <label>
                <div><input type="radio" name="importMode" value="add"> <strong>➕ Додати всі</strong></div>
                <small>Додати всі записи (можливі дублікати)</small>
            </label>
        </div>
        ${
          newRecords.length > 0
            ? `
        <div class="preview">
            <strong>📋 Нові записи для додавання:</strong>
            <ul>
                ${newRecords
                  .slice(0, 5)
                  .map(
                    (r) =>
                      `<li>${escapeHtml(r.orderName || "Без назви")} (${escapeHtml(r.orderNumber || "")}) - ${escapeHtml(r.responsible || "")}</li>`,
                  )
                  .join("")}
                ${newRecords.length > 5 ? `<li>... та ще ${newRecords.length - 5}</li>` : ""}
            </ul>
        </div>
        `
            : '<p style="color: #666; margin-top: 15px;">✨ Нових записів не знайдено</p>'
        }
        <div class="modal-actions">
            <button class="modal-btn cancel" onclick="closeModal()">Скасувати</button>
            <button class="modal-btn confirm" id="confirmImportBtn">Підтвердити імпорт</button>
        </div>
    `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  document.getElementById("confirmImportBtn").onclick = () =>
    processImport(importedData);
}

// Обробка імпорту
async function processImport(importedData) {
  const mode =
    document.querySelector('input[name="importMode"]:checked')?.value ||
    "replace";
  closeModal();
  showNotification("Імпорт даних...", "info");
  try {
    const currentRecords = await DB.service.getAll();
    let dataToImport = [];
    switch (mode) {
      case "replace":
        await DB.service.clear();
        dataToImport = importedData;
        break;
      case "merge":
        const currentKeys = new Set(
          currentRecords.map(
            (r) => `${r.orderName}|${r.orderNumber}|${r.deadline}`,
          ),
        );
        dataToImport = [
          ...currentRecords,
          ...importedData.filter(
            (imp) =>
              !currentKeys.has(
                `${imp.orderName}|${imp.orderNumber}|${imp.deadline}`,
              ),
          ),
        ];
        await DB.service.clear();
        break;
      case "add":
        dataToImport = [...currentRecords, ...importedData];
        await DB.service.clear();
        break;
    }
    const cleanData = dataToImport.map(({ id, ...rest }) => rest);
    if (cleanData.length > 0)
      await DB.service.instance.orders.bulkAdd(cleanData);
    await window.loadData();
    showNotification(
      `✅ Імпорт успішний! Додано ${cleanData.length} записів`,
      "success",
    );
  } catch (error) {
    console.error("Помилка при імпорті:", error);
    showNotification("❌ Помилка імпорту: " + error.message, "error");
  }
}

// Закрити модальне вікно
function closeModal() {
  const overlay = document.querySelector(".modal-overlay");
  if (overlay) overlay.remove();
}

// Показати сповіщення
function showNotification(message, type = "info") {
  const oldNotification = document.querySelector(".notification");
  if (oldNotification) oldNotification.remove();
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Експорт в Excel (CSV)
async function exportToExcel() {
  try {
    const records = await DB.service.getAll();
    if (records.length === 0) {
      showNotification("Немає даних для експорту", "error");
      return;
    }
    let csv =
      "№;НАЗВА НАКАЗУ;НОМЕР;ДАТА;ЗАХОДИ;ПЕРІОДИЧНІСТЬ;ТЕРМІН;ВІДПОВІДАЛЬНИЙ;НАПРЯМ;СТАТУС\n";
    const statusLabels = window.getStatusLabels();
    const periodicityOptions = window.getPeriodicityOptions();
    records.forEach((row, index) => {
      const orderDate = new Date(row.orderDate).toLocaleDateString("uk-UA");
      const deadline = new Date(row.deadline).toLocaleDateString("uk-UA");
      const statusText = statusLabels[row.status] || "Очікує";
      let periodicityText = row.periodicity || "";
      const found = periodicityOptions.find((p) => p.value === row.periodicity);
      if (found) periodicityText = found.label;
      let direction = row.direction;
      if (row.direction === "Інше" && row.customDirection)
        direction = row.customDirection;
      const escapeCsv = (str) => `"${String(str || "").replace(/"/g, '""')}"`;
      csv += `${index + 1};${escapeCsv(row.orderName)};${escapeCsv(row.orderNumber)};${orderDate};${escapeCsv(row.measures)};${escapeCsv(periodicityText)};${deadline};${escapeCsv(row.responsible)};${escapeCsv(direction)};${statusText}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `controls_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("Дані успішно експортовано в Excel", "success");
  } catch (error) {
    console.error("Помилка при експорті в Excel:", error);
    showNotification("Помилка при експорті в Excel", "error");
  }
}

// CSV ІМПОРТ
function importFromCSV() {
  document.getElementById("csvFileInput").click();
}

async function handleCSVFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const importedData = parseCSV(text);
    if (!importedData || importedData.length === 0) {
      showNotification("Не вдалося розпарсити CSV файл", "error");
      return;
    }
    const currentRecords = await DB.service.getAll();
    showImportModal(importedData, currentRecords);
  } catch (error) {
    console.error("Помилка при імпорті CSV:", error);
    showNotification(
      "Помилка при імпорті CSV. Перевірте формат файлу.",
      "error",
    );
  }
  event.target.value = "";
}

function parseCSV(text) {
  const lines = text.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(";")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const columnMap = {
    "№": "num",
    "НАЗВА НАКАЗУ": "orderName",
    "НОМЕР НАКАЗУ": "orderNumber",
    НОМЕР: "orderNumber",
    ДАТА: "orderDate",
    "ДАТА НАКАЗУ": "orderDate",
    ЗАХОДИ: "measures",
    ПЕРІОДИЧНІСТЬ: "periodicity",
    ТЕРМІН: "deadline",
    "ТЕРМІН ВИКОНАННЯ": "deadline",
    ВІДПОВІДАЛЬНИЙ: "responsible",
    НАПРЯМ: "direction",
    НАПРЯМОК: "direction",
    СТАТУС: "status",
  };
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;
    const record = {};
    headers.forEach((header, index) => {
      const key = columnMap[header] || header;
      let value = values[index].trim().replace(/^"|"$/g, "");
      if ((key === "orderDate" || key === "deadline") && value)
        value = convertDateToISO(value);
      if (key !== "num") record[key] = value;
    });
    if (!record.status) record.status = "pending";
    if (record.orderName) result.push(record);
  }
  return result;
}

function parseCSVLine(line) {
  const result = [];
  let current = "",
    inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ";" && !inQuotes) {
      result.push(current);
      current = "";
    } else current += char;
  }
  result.push(current);
  return result;
}

function convertDateToISO(dateStr) {
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{2})\.(\d{2})\.(\d{4})$/,
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
  ];
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) return dateStr;
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr;
}

// Глобальні функції
window.exportToJSON = exportToJSON;
window.importFromJSON = importFromJSON;
window.exportToExcel = exportToExcel;
window.importFromCSV = importFromCSV;
window.closeModal = closeModal;

// Обробники подій
document.addEventListener("DOMContentLoaded", () => {
  const csvInput = document.getElementById("csvFileInput");
  if (csvInput) csvInput.addEventListener("change", handleCSVFileSelect);
  const jsonInput = document.getElementById("fileInput");
  if (jsonInput) jsonInput.addEventListener("change", handleFileSelect);
});
