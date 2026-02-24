// ==================== ТЕСТОВІ ДАНІ ====================

// Тестові дані для розробки
const TEST_DATA = [
  {
    orderName: "Про проведення інвентаризації",
    orderNumber: "45-ОД",
    orderDate: "2024-01-15",
    measures: "Провести інвентаризацію складів",
    periodicity: "Щорічно",
    deadline: "2024-02-01",
    responsible: "Петренко О.М.",
    direction: "Службова діяльність",
    status: "in-progress",
  },
  {
    orderName: "Про пожежну безпеку",
    orderNumber: "67-ОД",
    orderDate: "2024-01-20",
    measures: "Перевірити вогнегасники, провести інструктаж",
    periodicity: "Щомісяця",
    deadline: "2024-01-30",
    responsible: "Іваненко В.В.",
    direction: "Службова діяльність",
    status: "pending",
  },
  {
    orderName: "Про оновлення ПЗ",
    orderNumber: "89-ОД",
    orderDate: "2024-01-10",
    measures: "Оновити програмне забезпечення на серверах",
    periodicity: "Одноразово",
    deadline: "2024-01-25",
    responsible: "Сидоренко П.І.",
    direction: "Інше",
    customDirection: "ІТ-інфраструктура",
    status: "completed",
  },
  {
    orderName: "Про навчання персоналу",
    orderNumber: "102-ОД",
    orderDate: "2024-01-22",
    measures: "Провести тренінг з охорони праці",
    periodicity: "Щокварталу",
    deadline: "2024-02-10",
    responsible: "Коваленко М.С.",
    direction: "Хімія",
    status: "pending",
  },
  {
    orderName: "Про ремонт обладнання",
    orderNumber: "118-ОД",
    orderDate: "2024-01-18",
    measures: "Замінити фільтри в системі вентиляції",
    periodicity: "Одноразово",
    deadline: "2024-01-28",
    responsible: "Шевченко А.В.",
    direction: "Піротехніка",
    status: "in-progress",
  },
  {
    orderName: "Назва",
    orderNumber: "номер",
    orderDate: "2026-02-23",
    measures: "Заходи",
    periodicity: "Щотижня",
    deadline: "2026-02-28",
    responsible: "Сторожукwewe",
    direction: "Службова діяльність",
    status: "pending",
  },
];

// Функція для додавання тестових даних
async function addTestDataIfNeeded(db) {
  try {
    const count = await db.orders.count();

    if (count === 0) {
      console.log("Додаю тестові дані...");
      await db.orders.bulkAdd(TEST_DATA);
      console.log("Тестові дані додано успішно");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Помилка при додаванні тестових даних:", error);
    return false;
  }
}

// Функція для очищення тестових даних
async function clearTestData(db) {
  try {
    await db.orders.clear();
    console.log("Всі дані видалено");
    return true;
  } catch (error) {
    console.error("Помилка при видаленні даних:", error);
    return false;
  }
}

// Експортуємо для використання
window.TestData = {
  addIfNeeded: addTestDataIfNeeded,
  clear: clearTestData,
  data: TEST_DATA,
};
