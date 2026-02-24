// ==================== ТЕСТУВАННЯ ВАРІАНТІВ ДРУКУ ====================
// Цей файл містить 4 різні варіанти друку для тестування
// Підключіть його тимчасово замість основного файлу друку

// ==================== ВАРІАНТ 1: ПРОСТИЙ ДРУК ПОТОЧНОЇ СТОРІНКИ ====================

function printVariant1_simple() {
  console.log("📄 Варіант 1: Простий друк поточної сторінки");

  // Зберігаємо оригінальний title
  const originalTitle = document.title;
  document.title = "Звіт з контролів";

  // Додаємо тимчасові стилі для друку
  const style = document.createElement("style");
  style.id = "print-style-v1";
  style.textContent = `
        @media print {
            /* Ховаємо елементи керування */
            .add-form, .filters, .btn-edit, .btn-delete,
            .stats button, .reset-filter-btn, .export-btn,
            .import-btn, .export-excel-btn {
                display: none !important;
            }

            /* Стилі для заголовка */
            .container {
                box-shadow: none;
                padding: 0;
                max-width: 100%;
            }

            h1 {
                font-size: 18pt;
                margin-bottom: 15px;
            }

            /* Стилі для таблиці */
            table {
                min-width: 100%;
                font-size: 10pt;
                border-collapse: collapse;
                width: 100%;
            }

            th {
                background: #eee !important;
                color: black !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                font-size: 9pt;
                padding: 5px;
            }

            td {
                padding: 4px;
                border-bottom: 1px solid #ccc;
            }

            /* Стилі для статистики */
            .stats {
                background: none !important;
                color: black !important;
                border: 1px solid #ccc;
                padding: 10px;
                margin-bottom: 15px;
            }

            .stat-item {
                background: none !important;
                color: black !important;
                border: 1px solid #ccc;
                cursor: default;
                padding: 3px 8px;
            }

            /* Кольори статусів */
            .status-badge {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .status-pending { background: #fed7d7 !important; color: black !important; }
            .status-in-progress { background: #feebc8 !important; color: black !important; }
            .status-completed { background: #c6f6d5 !important; color: black !important; }

            /* Нумерація сторінок */
            @page {
                margin: 1.5cm;
                @bottom-center {
                    content: "Сторінка " counter(page) " з " counter(pages);
                    font-size: 9pt;
                }
            }
        }

        /* Заголовок для друку */
        .print-header-v1 {
            display: none;
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }

        @media print {
            .print-header-v1 {
                display: block;
            }
        }
    `;
  document.head.appendChild(style);

  // Додаємо заголовок для друку
  const printHeader = document.createElement("div");
  printHeader.className = "print-header-v1";
  printHeader.innerHTML = `
        <h2>ОБЛІК КОНТРОЛІВ ТА ПРОТОКОЛЬНИХ РІШЕНЬ</h2>
        <p>Звіт створено: ${new Date().toLocaleString("uk-UA")}</p>
        <p>Всього записів: ${allRecords.length}</p>
        <hr>
    `;
  document
    .querySelector(".container")
    .insertBefore(printHeader, document.querySelector(".stats-status"));

  // Друкуємо
  window.print();

  // Відновлюємо сторінку
  document.title = originalTitle;
  document.head.removeChild(style);
  printHeader.remove();
}

// ==================== ВАРІАНТ 2: НОВЕ ВІКНО З ТАБЛИЦЕЮ ====================

function printVariant2_newWindow() {
  console.log("📄 Варіант 2: Нове вікно з таблицею");

  // Отримуємо поточні дані (з урахуванням фільтрів)
  const visibleRecords = getVisibleRecords();
  const stats = calculateStats(visibleRecords);

  // Створюємо HTML для друку
  const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Звіт з контролів</title>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Times New Roman', serif;
                    margin: 2cm;
                    line-height: 1.4;
                }
                h1 {
                    text-align: center;
                    color: #333;
                    font-size: 24pt;
                    margin-bottom: 5px;
                }
                .subtitle {
                    text-align: center;
                    color: #666;
                    font-size: 12pt;
                    margin-bottom: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                }
                .stats {
                    margin: 20px 0;
                    padding: 15px;
                    border: 1px solid #ccc;
                    background: #f9f9f9;
                    border-radius: 5px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                }
                .stat-item-print {
                    padding: 8px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                    font-size: 10pt;
                }
                th {
                    background: #333;
                    color: white;
                    padding: 10px 5px;
                    text-align: left;
                    font-size: 9pt;
                }
                td {
                    padding: 8px 5px;
                    border-bottom: 1px solid #ddd;
                    vertical-align: top;
                }
                tr:nth-child(even) {
                    background: #f9f9f9;
                }
                .footer {
                    margin-top: 40px;
                    text-align: right;
                    border-top: 1px solid #ccc;
                    padding-top: 20px;
                }
                .signature-line {
                    margin-top: 60px;
                    display: flex;
                    justify-content: space-between;
                }
                .signature-item {
                    width: 200px;
                    border-bottom: 1px solid #333;
                    margin-top: 5px;
                }
                .page-break {
                    page-break-after: always;
                }
                @media print {
                    .no-print { display: none; }
                    button { display: none; }
                }
                .badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 8pt;
                }
                .badge-pending { background: #fed7d7; }
                .badge-progress { background: #feebc8; }
                .badge-completed { background: #c6f6d5; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ОБЛІК КОНТРОЛІВ ТА ПРОТОКОЛЬНИХ РІШЕНЬ</h1>
                <div class="subtitle">Звіт сформовано: ${new Date().toLocaleString("uk-UA")}</div>
            </div>

            <div class="stats">
                <h3>📊 Загальна статистика</h3>
                <div class="stats-grid">
                    <div class="stat-item-print">📋 Всього записів: <strong>${stats.total}</strong></div>
                    <div class="stat-item-print">✅ Виконано: <strong>${stats.completed}</strong></div>
                    <div class="stat-item-print">⏳ В роботі: <strong>${stats.inProgress}</strong></div>
                    <div class="stat-item-print">⏰ Очікує: <strong>${stats.pending}</strong></div>
                    <div class="stat-item-print">⚠️ Прострочено: <strong>${stats.overdue}</strong></div>
                </div>

                <h4 style="margin-top: 15px;">🎯 Напрямки</h4>
                <div class="stats-grid">
                    <div class="stat-item-print">📋 Служба: <strong>${stats.service}</strong></div>
                    <div class="stat-item-print">🧪 Хімія: <strong>${stats.chemistry}</strong></div>
                    <div class="stat-item-print">💥 Піро: <strong>${stats.pyro}</strong></div>
                    <div class="stat-item-print">🔄 Інше: <strong>${stats.other}</strong></div>
                </div>
            </div>

            <h3>Детальний перелік заходів</h3>

            <table>
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Назва наказу</th>
                        <th>Номер</th>
                        <th>Дата</th>
                        <th>Заходи</th>
                        <th>Період</th>
                        <th>Термін</th>
                        <th>Відповідальний</th>
                        <th>Напрям</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    ${visibleRecords
                      .map((row, index) => {
                        const orderDate = new Date(
                          row.orderDate,
                        ).toLocaleDateString("uk-UA");
                        const deadline = new Date(
                          row.deadline,
                        ).toLocaleDateString("uk-UA");
                        const statusText =
                          STATUS_LABELS[row.status] || "Очікує";

                        let direction = row.direction;
                        if (
                          row.direction === DIRECTIONS.OTHER &&
                          row.customDirection
                        ) {
                          direction = row.customDirection;
                        }

                        const statusClass =
                          row.status === "completed"
                            ? "badge-completed"
                            : row.status === "in-progress"
                              ? "badge-progress"
                              : "badge-pending";

                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${row.orderName}</td>
                                <td>${row.orderNumber}</td>
                                <td>${orderDate}</td>
                                <td>${row.measures}</td>
                                <td>${row.periodicity || "-"}</td>
                                <td>${deadline}</td>
                                <td>${row.responsible}</td>
                                <td>${direction}</td>
                                <td><span class="badge ${statusClass}">${statusText}</span></td>
                            </tr>
                        `;
                      })
                      .join("")}
                </tbody>
            </table>

            <div class="footer">
                <p>Всього записів у звіті: <strong>${visibleRecords.length}</strong></p>
            </div>

            <div class="signature-line">
                <div>
                    <div>Звіт склав:</div>
                    <div class="signature-item"></div>
                </div>
                <div>
                    <div>Дата:</div>
                    <div class="signature-item"></div>
                </div>
            </div>

            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ Друк</button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #a0aec0; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">❌ Закрити</button>
            </div>
        </body>
        </html>
    `;

  // Відкриваємо нове вікно для друку
  const printWindow = window.open("", "_blank");
  printWindow.document.write(printContent);
  printWindow.document.close();
}

// ==================== ВАРІАНТ 3: ДЕТАЛЬНИЙ ЗВІТ З ГРУПУВАННЯМ ====================

function printVariant3_detailed() {
  console.log("📄 Варіант 3: Детальний звіт з групуванням");

  const visibleRecords = getVisibleRecords();
  const stats = calculateStats(visibleRecords);

  // Групуємо за статусами
  const groupedByStatus = {
    completed: visibleRecords.filter((r) => r.status === STATUSES.COMPLETED),
    inProgress: visibleRecords.filter((r) => r.status === STATUSES.IN_PROGRESS),
    pending: visibleRecords.filter((r) => r.status === STATUSES.PENDING),
  };

  // Групуємо за напрямками
  const groupedByDirection = {
    service: visibleRecords.filter((r) => r.direction === DIRECTIONS.SERVICE),
    chemistry: visibleRecords.filter(
      (r) => r.direction === DIRECTIONS.CHEMISTRY,
    ),
    pyro: visibleRecords.filter((r) => r.direction === DIRECTIONS.PYRO),
    other: visibleRecords.filter(
      (r) =>
        r.direction === DIRECTIONS.OTHER ||
        (r.direction && !Object.values(DIRECTIONS).includes(r.direction)),
    ),
  };

  const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Детальний звіт з контролів</title>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 2cm;
                    line-height: 1.5;
                }
                h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
                h2 { color: #34495e; margin-top: 30px; }
                h3 { color: #7f8c8d; }
                .section { margin-bottom: 40px; }
                .stats-card {
                    background: #ecf0f1;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .group-section {
                    background: #f9f9f9;
                    padding: 15px;
                    margin: 20px 0;
                    border-left: 4px solid #3498db;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    font-size: 10pt;
                }
                th {
                    background: #34495e;
                    color: white;
                    padding: 8px;
                }
                td {
                    padding: 8px;
                    border-bottom: 1px solid #bdc3c7;
                }
                .status-badge-print {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 8pt;
                    font-weight: bold;
                }
                .status-completed { background: #2ecc71; color: white; }
                .status-progress { background: #f39c12; color: white; }
                .status-pending { background: #e74c3c; color: white; }
                .page-break { page-break-before: always; }
                .footer {
                    margin-top: 50px;
                    text-align: center;
                    color: #7f8c8d;
                    font-size: 9pt;
                }
            </style>
        </head>
        <body>
            <h1>ДЕТАЛЬНИЙ ЗВІТ З КОНТРОЛІВ</h1>
            <p>Сформовано: ${new Date().toLocaleString("uk-UA")}</p>

            <div class="stats-card">
                <h2>📊 Загальна статистика</h2>
                <p>Всього записів: <strong>${stats.total}</strong></p>
                <p>✅ Виконано: ${stats.completed} | ⏳ В роботі: ${stats.inProgress} | ⏰ Очікує: ${stats.pending}</p>
                <p>⚠️ Прострочено: <strong>${stats.overdue}</strong></p>
            </div>

            <!-- Розділ 1: Деталізація за статусами -->
            <div class="section">
                <h2>1. Деталізація за статусами</h2>

                ${
                  groupedByStatus.completed.length > 0
                    ? `
                <div class="group-section">
                    <h3>✅ Виконані (${groupedByStatus.completed.length})</h3>
                    <table>
                        <tr><th>Назва</th><th>Відповідальний</th><th>Термін</th><th>Напрям</th></tr>
                        ${groupedByStatus.completed
                          .map(
                            (r) => `
                            <tr>
                                <td>${r.orderName}</td>
                                <td>${r.responsible}</td>
                                <td>${new Date(r.deadline).toLocaleDateString("uk-UA")}</td>
                                <td>${r.direction}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </table>
                </div>
                `
                    : ""
                }

                ${
                  groupedByStatus.inProgress.length > 0
                    ? `
                <div class="group-section">
                    <h3>⏳ В роботі (${groupedByStatus.inProgress.length})</h3>
                    <table>
                        <tr><th>Назва</th><th>Відповідальний</th><th>Термін</th><th>Напрям</th></tr>
                        ${groupedByStatus.inProgress
                          .map(
                            (r) => `
                            <tr>
                                <td>${r.orderName}</td>
                                <td>${r.responsible}</td>
                                <td>${new Date(r.deadline).toLocaleDateString("uk-UA")}</td>
                                <td>${r.direction}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </table>
                </div>
                `
                    : ""
                }

                ${
                  groupedByStatus.pending.length > 0
                    ? `
                <div class="group-section">
                    <h3>⏰ Очікують (${groupedByStatus.pending.length})</h3>
                    <table>
                        <tr><th>Назва</th><th>Відповідальний</th><th>Термін</th><th>Напрям</th></tr>
                        ${groupedByStatus.pending
                          .map(
                            (r) => `
                            <tr>
                                <td>${r.orderName}</td>
                                <td>${r.responsible}</td>
                                <td>${new Date(r.deadline).toLocaleDateString("uk-UA")}</td>
                                <td>${r.direction}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </table>
                </div>
                `
                    : ""
                }
            </div>

            <div class="page-break"></div>

            <!-- Розділ 2: Деталізація за напрямками -->
            <div class="section">
                <h2>2. Деталізація за напрямками</h2>

                ${
                  groupedByDirection.service.length > 0
                    ? `
                <div class="group-section">
                    <h3>📋 Службова діяльність (${groupedByDirection.service.length})</h3>
                    <table>
                        <tr><th>Назва</th><th>Відповідальний</th><th>Статус</th><th>Термін</th></tr>
                        ${groupedByDirection.service
                          .map(
                            (r) => `
                            <tr>
                                <td>${r.orderName}</td>
                                <td>${r.responsible}</td>
                                <td>${STATUS_LABELS[r.status]}</td>
                                <td>${new Date(r.deadline).toLocaleDateString("uk-UA")}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </table>
                </div>
                `
                    : ""
                }

                ${
                  groupedByDirection.chemistry.length > 0
                    ? `
                <div class="group-section">
                    <h3>🧪 Хімія (${groupedByDirection.chemistry.length})</h3>
                    <table>
                        <tr><th>Назва</th><th>Відповідальний</th><th>Статус</th><th>Термін</th></tr>
                        ${groupedByDirection.chemistry
                          .map(
                            (r) => `
                            <tr>
                                <td>${r.orderName}</td>
                                <td>${r.responsible}</td>
                                <td>${STATUS_LABELS[r.status]}</td>
                                <td>${new Date(r.deadline).toLocaleDateString("uk-UA")}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </table>
                </div>
                `
                    : ""
                }

                ${
                  groupedByDirection.pyro.length > 0
                    ? `
                <div class="group-section">
                    <h3>💥 Піротехніка (${groupedByDirection.pyro.length})</h3>
                    <table>
                        <tr><th>Назва</th><th>Відповідальний</th><th>Статус</th><th>Термін</th></tr>
                        ${groupedByDirection.pyro
                          .map(
                            (r) => `
                            <tr>
                                <td>${r.orderName}</td>
                                <td>${r.responsible}</td>
                                <td>${STATUS_LABELS[r.status]}</td>
                                <td>${new Date(r.deadline).toLocaleDateString("uk-UA")}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </table>
                </div>
                `
                    : ""
                }

                ${
                  groupedByDirection.other.length > 0
                    ? `
                <div class="group-section">
                    <h3>🔄 Інше (${groupedByDirection.other.length})</h3>
                    <table>
                        <tr><th>Назва</th><th>Відповідальний</th><th>Статус</th><th>Термін</th></tr>
                        ${groupedByDirection.other
                          .map(
                            (r) => `
                            <tr>
                                <td>${r.orderName}</td>
                                <td>${r.responsible}</td>
                                <td>${STATUS_LABELS[r.status]}</td>
                                <td>${new Date(r.deadline).toLocaleDateString("uk-UA")}</td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </table>
                </div>
                `
                    : ""
                }
            </div>

            <div class="footer">
                <p>Звіт сформовано автоматично. Всього записів: ${visibleRecords.length}</p>
            </div>
        </body>
        </html>
    `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(printContent);
  printWindow.document.close();
}

// ==================== ВАРІАНТ 4: КОРОТКИЙ ЗВІТ ДЛЯ КЕРІВНИЦТВА ====================

function printVariant4_executive() {
  console.log("📄 Варіант 4: Короткий звіт для керівництва");

  const visibleRecords = getVisibleRecords();
  const stats = calculateStats(visibleRecords);

  // Знаходимо прострочені
  const today = new Date().toISOString().split("T")[0];
  const overdue = visibleRecords.filter(
    (r) => r.deadline < today && r.status !== STATUSES.COMPLETED,
  );

  const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Короткий звіт з контролів</title>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Helvetica', sans-serif;
                    margin: 2.5cm;
                    line-height: 1.6;
                }
                h1 {
                    color: #2c3e50;
                    font-size: 24pt;
                    text-align: center;
                    margin-bottom: 5px;
                }
                .date {
                    text-align: center;
                    color: #7f8c8d;
                    margin-bottom: 40px;
                }
                .executive-summary {
                    background: #f8f9fa;
                    padding: 25px;
                    border-radius: 10px;
                    margin-bottom: 40px;
                    border: 2px solid #3498db;
                }
                .summary-title {
                    color: #3498db;
                    font-size: 14pt;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }
                .summary-item {
                    padding: 15px;
                    background: white;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .summary-label {
                    color: #7f8c8d;
                    font-size: 10pt;
                }
                .summary-value {
                    font-size: 24pt;
                    font-weight: bold;
                    color: #2c3e50;
                }
                .warning {
                    color: #e74c3c;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th {
                    text-align: left;
                    border-bottom: 2px solid #34495e;
                    padding: 10px 5px;
                }
                td {
                    padding: 8px 5px;
                    border-bottom: 1px solid #bdc3c7;
                }
                .footer {
                    margin-top: 50px;
                    border-top: 1px solid #bdc3c7;
                    padding-top: 20px;
                    text-align: right;
                }
            </style>
        </head>
        <body>
            <h1>ЗВІТ З КОНТРОЛІВ</h1>
            <div class="date">${new Date().toLocaleDateString("uk-UA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>

            <div class="executive-summary">
                <div class="summary-title">📊 Виконавче резюме</div>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Всього заходів</div>
                        <div class="summary-value">${stats.total}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Виконано</div>
                        <div class="summary-value" style="color: #27ae60;">${stats.completed}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">В роботі</div>
                        <div class="summary-value" style="color: #f39c12;">${stats.inProgress}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Очікує</div>
                        <div class="summary-value" style="color: #3498db;">${stats.pending}</div>
                    </div>
                </div>

                <div style="margin-top: 20px; padding: 15px; background: ${overdue.length > 0 ? "#fee" : "#e8f5e9"}; border-radius: 5px;">
                    <strong style="color: ${overdue.length > 0 ? "#c0392b" : "#27ae60"};">
                        ${overdue.length > 0 ? `⚠️ Прострочено: ${overdue.length} заходів` : "✅ Прострочених заходів немає"}
                    </strong>
                </div>
            </div>

            <h3>🎯 Стан виконання за напрямками</h3>
            <table>
                <tr>
                    <th>Напрямок</th>
                    <th>Всього</th>
                    <th>Виконано</th>
                    <th>В роботі</th>
                    <th>Очікує</th>
                </tr>
                <tr>
                    <td>📋 Службова діяльність</td>
                    <td>${stats.service}</td>
                    <td>${visibleRecords.filter((r) => r.direction === DIRECTIONS.SERVICE && r.status === STATUSES.COMPLETED).length}</td>
                    <td>${visibleRecords.filter((r) => r.direction === DIRECTIONS.SERVICE && r.status === STATUSES.IN_PROGRESS).length}</td>
                    <td>${visibleRecords.filter((r) => r.direction === DIRECTIONS.SERVICE && r.status === STATUSES.PENDING).length}</td>
                </tr>
                <tr>
                    <td>🧪 Хімія</td>
                    <td>${stats.chemistry}</td>
                    <td>${visibleRecords.filter((r) => r.direction === DIRECTIONS.CHEMISTRY && r.status === STATUSES.COMPLETED).length}</td>
                    <td>${visibleRecords.filter((r) => r.direction === DIRECTIONS.CHEMISTRY && r.status === STATUSES.IN_PROGRESS).length}</td>
                    <td>${visibleRecords.filter((r) => r.direction === DIRECTIONS.CHEMISTRY && r.status === STATUSES.PENDING).length}</td>
                </tr>
                <tr>
                    <td>💥 Піротехніка</td>
                    <td>${stats.pyro}</td>
                    <td>${visibleRecords.filter((r) => r.direction === DIRECTIONS.PYRO && r.status === STATUSES.COMPLETED).length}</td>
                    <td>${visibleRecords.filter((r) => r.direction === DIRECTIONS.PYRO && r.status === STATUSES.IN_PROGRESS).length}</td>
                    <td>${visibleRecords.filter((r) => r.direction === DIRECTIONS.PYRO && r.status === STATUSES.PENDING).length}</td>
                </tr>
                <tr>
                    <td>🔄 Інше</td>
                    <td>${stats.other}</td>
                    <td>${visibleRecords.filter((r) => (r.direction === DIRECTIONS.OTHER || !Object.values(DIRECTIONS).includes(r.direction)) && r.status === STATUSES.COMPLETED).length}</td>
                    <td>${visibleRecords.filter((r) => (r.direction === DIRECTIONS.OTHER || !Object.values(DIRECTIONS).includes(r.direction)) && r.status === STATUSES.IN_PROGRESS).length}</td>
                    <td>${visibleRecords.filter((r) => (r.direction === DIRECTIONS.OTHER || !Object.values(DIRECTIONS).includes(r.direction)) && r.status === STATUSES.PENDING).length}</td>
                </tr>
            </table>

            ${
              overdue.length > 0
                ? `
            <h3 style="color: #e74c3c; margin-top: 40px;">⚠️ Прострочені заходи</h3>
            <table>
                <tr>
                    <th>Назва</th>
                    <th>Відповідальний</th>
                    <th>Термін</th>
                    <th>Напрям</th>
                </tr>
                ${overdue
                  .map(
                    (r) => `
                    <tr>
                        <td>${r.orderName}</td>
                        <td>${r.responsible}</td>
                        <td>${new Date(r.deadline).toLocaleDateString("uk-UA")}</td>
                        <td>${r.direction}</td>
                    </tr>
                `,
                  )
                  .join("")}
            </table>
            `
                : ""
            }

            <div class="footer">
                <p>Звіт підготовлено автоматично. Для детальної інформації звертайтесь до відповідальних осіб.</p>
            </div>
        </body>
        </html>
    `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(printContent);
  printWindow.document.close();
}

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================

// Отримати видимі записи (з урахуванням фільтрів)
function getVisibleRecords() {
  const tbody = document.getElementById("tableBody");
  const rows = tbody.querySelectorAll("tr");

  if (rows.length === 0 || (rows.length === 1 && rows[0].cells.length === 1)) {
    return allRecords; // Якщо таблиця порожня, повертаємо всі
  }

  // Парсимо ID з рядків
  const visibleIds = [];
  rows.forEach((row) => {
    if (row.id && row.id.startsWith("row-")) {
      const id = parseInt(row.id.replace("row-", ""));
      if (!isNaN(id)) visibleIds.push(id);
    }
  });

  return allRecords.filter((r) => visibleIds.includes(r.id));
}

// Розрахувати статистику
function calculateStats(records) {
  const today = new Date().toISOString().split("T")[0];

  return {
    total: records.length,
    completed: records.filter((r) => r.status === STATUSES.COMPLETED).length,
    pending: records.filter((r) => r.status === STATUSES.PENDING).length,
    inProgress: records.filter((r) => r.status === STATUSES.IN_PROGRESS).length,
    overdue: records.filter(
      (r) => r.deadline < today && r.status !== STATUSES.COMPLETED,
    ).length,
    service: records.filter((r) => r.direction === DIRECTIONS.SERVICE).length,
    chemistry: records.filter((r) => r.direction === DIRECTIONS.CHEMISTRY)
      .length,
    pyro: records.filter((r) => r.direction === DIRECTIONS.PYRO).length,
    other: records.filter(
      (r) =>
        r.direction === DIRECTIONS.OTHER ||
        (r.direction && !Object.values(DIRECTIONS).includes(r.direction)),
    ).length,
  };
}

// ==================== ДОДАЄМО КНОПКИ В ІНТЕРФЕЙС ====================

function addPrintTestButtons() {
  const filtersDiv = document.querySelector(".filters");
  if (!filtersDiv) return;

  // Створюємо контейнер для кнопок тестування
  const testContainer = document.createElement("div");
  testContainer.className = "print-test-container";
  testContainer.style.marginTop = "10px";
  testContainer.style.padding = "10px";
  testContainer.style.background = "#f0f4ff";
  testContainer.style.borderRadius = "8px";
  testContainer.style.display = "flex";
  testContainer.style.gap = "10px";
  testContainer.style.flexWrap = "wrap";

  testContainer.innerHTML = `
        <span style="font-weight: 600; color: #4a5568; padding: 5px;">🧪 ТЕСТ ДРУКУ:</span>
        <button class="print-test-btn" onclick="printVariant1_simple()" style="background: #667eea;">📄 Варіант 1</button>
        <button class="print-test-btn" onclick="printVariant2_newWindow()" style="background: #48bb78;">📄 Варіант 2</button>
        <button class="print-test-btn" onclick="printVariant3_detailed()" style="background: #ed8936;">📄 Варіант 3</button>
        <button class="print-test-btn" onclick="printVariant4_executive()" style="background: #9f7aea;">📄 Варіант 4</button>
    `;

  filtersDiv.appendChild(testContainer);

  // Додаємо стилі для кнопок
  const style = document.createElement("style");
  style.textContent = `
        .print-test-btn {
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s;
        }
        .print-test-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
    `;
  document.head.appendChild(style);
}

// Викликаємо додавання кнопок після завантаження сторінки
document.addEventListener("DOMContentLoaded", () => {
  // Чекаємо трохи, щоб інтерфейс завантажився
  setTimeout(addPrintTestButtons, 1000);
});

// Робимо функції глобальними
window.printVariant1_simple = printVariant1_simple;
window.printVariant2_newWindow = printVariant2_newWindow;
window.printVariant3_detailed = printVariant3_detailed;
window.printVariant4_executive = printVariant4_executive;
