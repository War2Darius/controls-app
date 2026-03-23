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

// Обробник імпорту
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

    // Показуємо модальне вікно з вибором дії
    showImportModal(importedData);
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
function showImportModal(importedData) {
  // Створюємо затемнений фон
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  // Створюємо модальне вікно
  const modal = document.createElement("div");
  modal.className = "modal";

  // Аналізуємо дані
  const currentCount = allRecords.length;
  const newCount = importedData.length;

  // Знаходимо нові записи (яких немає в поточній БД)
  const newRecords = importedData.filter(
    (imported) =>
      !allRecords.some(
        (current) =>
          current.orderName === imported.orderName &&
          current.orderNumber === imported.orderNumber &&
          current.deadline === imported.deadline,
      ),
  );

  modal.innerHTML = `
        <h3>📥 Імпорт даних</h3>
        <div class="modal-content">
            <p>Поточних записів: <strong>${currentCount}</strong></p>
            <p>В імпортованому файлі: <strong>${newCount}</strong></p>
            <p>Нових записів знайдено: <strong>${newRecords.length}</strong></p>

            <hr>

            <div class="import-options">
                <label>
                    <input type="radio" name="importMode" value="replace" checked>
                    <strong>🔁 Замінити всі дані</strong>
                    <small>Поточні дані будуть видалені</small>
                </label>

                <label>
                    <input type="radio" name="importMode" value="merge">
                    <strong>🔄 Об'єднати з поточними</strong>
                    <small>Додати нові записи (за назвою + номером)</small>
                </label>

                <label>
                    <input type="radio" name="importMode" value="add">
                    <strong>➕ Додати всі</strong>
                    <small>Додати всі імпортовані записи (можливі дублікати)</small>
                </label>
            </div>

            ${
              newRecords.length > 0
                ? `
                <div class="preview">
                    <p>Нові записи для додавання:</p>
                    <ul>
                        ${newRecords
                          .slice(0, 5)
                          .map(
                            (r) =>
                              `<li>${r.orderName} (${r.orderNumber}) - ${r.responsible}</li>`,
                          )
                          .join("")}
                        ${newRecords.length > 5 ? `<li>... та ще ${newRecords.length - 5}</li>` : ""}
                    </ul>
                </div>
            `
                : ""
            }
        </div>

        <div class="modal-actions">
            <button class="modal-btn cancel" onclick="closeModal()">Скасувати</button>
            <button class="modal-btn confirm" onclick="processImport(${JSON.stringify(importedData).replace(/"/g, "&quot;")})">Підтвердити імпорт</button>
        </div>
    `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Додаємо стилі для модального вікна, якщо їх ще немає
  addModalStyles();
}

// Обробка імпорту з вибраним режимом
async function processImport(importedData) {
  const mode = document.querySelector('input[name="importMode"]:checked').value;

  try {
    let dataToImport = [];

    switch (mode) {
      case "replace":
        // Замінити всі дані
        await DB.service.clear();
        dataToImport = importedData;
        break;

      case "merge":
        // Об'єднати з поточними (додати тільки нові)
        const currentKeys = new Set(
          allRecords.map(
            (r) => `${r.orderName}|${r.orderNumber}|${r.deadline}`,
          ),
        );

        dataToImport = [
          ...allRecords,
          ...importedData.filter(
            (imported) =>
              !currentKeys.has(
                `${imported.orderName}|${imported.orderNumber}|${imported.deadline}`,
              ),
          ),
        ];

        await DB.service.clear();
        break;

      case "add":
        // Додати всі (можливі дублікати)
        dataToImport = [...allRecords, ...importedData];
        await DB.service.clear();
        break;
    }

    // Видаляємо id перед додаванням
    const cleanData = dataToImport.map(({ id, ...rest }) => rest);
    await DB.service.instance.orders.bulkAdd(cleanData);

    // Оновлюємо дані
    await loadData();
    closeModal();

    showNotification(
      `Дані успішно імпортовано (${cleanData.length} записів)`,
      "success",
    );
  } catch (error) {
    console.error("Помилка при імпорті:", error);
    showNotification("Помилка при імпорті даних", "error");
    closeModal();
  }
}

// Закрити модальне вікно
function closeModal() {
  const overlay = document.querySelector(".modal-overlay");
  if (overlay) {
    overlay.remove();
  }
}

// Показати сповіщення
function showNotification(message, type = "info") {
  // Видаляємо попередні сповіщення
  const oldNotification = document.querySelector(".notification");
  if (oldNotification) {
    oldNotification.remove();
  }

  // Створюємо нове сповіщення
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Автоматично ховаємо через 3 секунди
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Додати стилі для модального вікна та сповіщень
function addModalStyles() {
  if (document.getElementById("export-import-styles")) return;

  const style = document.createElement("style");
  style.id = "export-import-styles";
  style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .modal {
            background: white;
            border-radius: 10px;
            padding: 25px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .modal h3 {
            margin-bottom: 20px;
            color: #333;
        }

        .modal-content {
            margin-bottom: 20px;
        }

        .import-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin: 20px 0;
        }

        .import-options label {
            display: flex;
            flex-direction: column;
            padding: 10px;
            border: 2px solid #e1e1e1;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .import-options label:hover {
            border-color: #667eea;
            background: #f8f9fa;
        }

        .import-options input[type="radio"] {
            margin-right: 10px;
        }

        .import-options small {
            color: #666;
            margin-top: 5px;
        }

        .preview {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }

        .preview ul {
            margin-left: 20px;
            margin-top: 10px;
        }

        .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }

        .modal-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }

        .modal-btn.cancel {
            background: #e1e1e1;
            color: #333;
        }

        .modal-btn.cancel:hover {
            background: #d1d1d1;
        }

        .modal-btn.confirm {
            background: #48bb78;
            color: white;
        }

        .modal-btn.confirm:hover {
            background: #38a169;
        }

        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .notification-success {
            background: #48bb78;
        }

        .notification-error {
            background: #f56565;
        }

        .notification-info {
            background: #4299e1;
        }

        .notification.fade-out {
            animation: fadeOut 0.3s ease forwards;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;

  document.head.appendChild(style);
}

// Додаткові функції експорту

// Експорт в Excel (CSV)
async function exportToExcel() {
  try {
    const records = allRecords; // Використовуємо поточні відфільтровані дані

    if (records.length === 0) {
      showNotification("Немає даних для експорту", "error");
      return;
    }

    // Створюємо CSV з заголовками
    let csv =
      "№;НАЗВА НАКАЗУ;НОМЕР;ДАТА;ЗАХОДИ;ПЕРІОДИЧНІСТЬ;ТЕРМІН;ВІДПОВІДАЛЬНИЙ;НАПРЯМ;СТАТУС\n";

    records.forEach((row, index) => {
      const orderDate = new Date(row.orderDate).toLocaleDateString("uk-UA");
      const deadline = new Date(row.deadline).toLocaleDateString("uk-UA");
      const statusLabels = window.getStatusLabels ? window.getStatusLabels() : {pending: "Очікує", "in-progress": "В роботі", completed: "Виконано"};
      const statusText = statusLabels[row.status] || "Очікує";

      let direction = row.direction;
      if (row.direction === "Інше" && row.customDirection) {
        direction = `${row.customDirection}`;
      }

      // Екрануємо лапки та крапки з комою
      const escapeCsv = (str) => `"${String(str || "").replace(/"/g, '""')}"`;

      csv += `${index + 1};${escapeCsv(row.orderName)};${escapeCsv(row.orderNumber)};${orderDate};${escapeCsv(row.measures)};${escapeCsv(row.periodicity || "")};${deadline};${escapeCsv(row.responsible)};${escapeCsv(direction)};${statusText}\n`;
    });

    // Додаємо BOM для українських літер
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

// Експорт в PDF (через друк)
function exportToPDF() {
  // Можна використати ту саму логіку, що й для друку
  // Але відкрити вікно друку, де користувач зможе вибрати "Зберегти як PDF"
  printReport();
}

// Робимо функції глобальними
window.exportToJSON = exportToJSON;
window.importFromJSON = importFromJSON;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
window.closeModal = closeModal;
window.processImport = processImport;
window.importFromCSV = importFromCSV;

// ==================== CSV ІМПОРТ ====================

// Імпорт з CSV
function importFromCSV() {
  document.getElementById("csvFileInput").click();
}

// Обробник вибору CSV файлу
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

    // Показуємо модальне вікно з вибором дії
    showImportModal(importedData);
  } catch (error) {
    console.error("Помилка при імпорті CSV:", error);
    showNotification("Помилка при імпорті CSV. Перевірте формат файлу.", "error");
  }

  event.target.value = "";
}

// Парсинг CSV тексту
function parseCSV(text) {
  const lines = text.split("\n").filter(line => line.trim());
  if (lines.length < 2) return [];

  // Витягуємо заголовки
  const headers = lines[0].split(";").map(h => h.trim().replace(/^"|"$/g, ""));
  
  // Маппінг колонок
  const columnMap = {
    "№": "num",
    "НАЗВА НАКАЗУ": "orderName",
    "НОМЕР НАКАЗУ": "orderNumber", 
    "НОМЕР": "orderNumber",
    "ДАТА": "orderDate",
    "ДАТА НАКАЗУ": "orderDate",
    "ЗАХОДИ": "measures",
    "ПЕРІОДИЧНІСТЬ": "periodicity",
    "ТЕРМІН": "deadline",
    "ТЕРМІН ВИКОНАННЯ": "deadline",
    "ВІДПОВІДАЛЬНИЙ": "responsible",
    "НАПРЯМ": "direction",
    "НАПРЯМОК": "direction",
    "СТАТУС": "status"
  };

  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const record = {};
    headers.forEach((header, index) => {
      const key = columnMap[header] || header;
      let value = values[index].trim().replace(/^"|"$/g, "");
      
      // Конвертація дат
      if ((key === "orderDate" || key === "deadline") && value) {
        value = convertDateToISO(value);
      }
      
      if (key !== "num") {
        record[key] = value;
      }
    });

    // Встановлюємо статус за замовчуванням
    if (!record.status) {
      record.status = "pending";
    }

    // Якщо напрямок "Інше" з customDirection
    if (record.direction && record.direction.includes(":")) {
      const parts = record.direction.split(":");
      record.direction = "Інше";
      record.customDirection = parts[1].trim();
    }

    if (record.orderName) {
      result.push(record);
    }
  }

  return result;
}

// Парсинг однієї CSV рядки з урахуванням лапок
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ";" && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

// Конвертація дати в ISO формат
function convertDateToISO(dateStr) {
  // Спробуємо різні формати
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        return dateStr;
      } else if (format === formats[1] || format === formats[2]) {
        const day = match[1];
        const month = match[2];
        const year = match[3];
        return `${year}-${month}-${day}`;
      }
    }
  }

  // Якщо не вдалося розпарсити, повертаємо як є
  return dateStr;
}

// Додаємо обробник для CSV input
document.addEventListener("DOMContentLoaded", function() {
  const csvInput = document.getElementById("csvFileInput");
  if (csvInput) {
    csvInput.addEventListener("change", handleCSVFileSelect);
  }
  
  // Обробник для JSON input
  const jsonInput = document.getElementById("fileInput");
  if (jsonInput) {
    jsonInput.addEventListener("change", handleFileSelect);
  }
});
