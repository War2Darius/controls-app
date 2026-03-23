// ==================== ТЕСТОВІ ДАНІ ====================

// Тестові дані для розробки
const TEST_DATA = [
  {
    orderName: "Про затвердження плану основних заходів",
    orderNumber: "45-ОД",
    orderDate: "2024-01-15",
    measures: "Провести інструктаж з особовим складом",
    periodicity: "p_1",
    deadline: "2024-12-20",
    responsible: "Іванов І.І.",
    direction: "Службова діяльність",
    status: "pending",
  },
{
  orderName: "Про організацію хімічної підготовки",
  orderNumber: "67-ОД",
  orderDate: "2024-02-10",
  measures: "Провести заняття з хімічного захисту",
  periodicity: "p_4",
  deadline: "2024-12-15",
  responsible: "Петренко П.П.",
  direction: "Хімія",
  status: "in-progress",
},
{
  orderName: "Про перевірку піротехнічних засобів",
  orderNumber: "89-ОД",
  orderDate: "2024-03-05",
  measures: "Провести інвентаризацію піротехніки",
  periodicity: "p_6",
  deadline: "2024-11-30",
  responsible: "Сидоренко С.С.",
  direction: "Піротехніка",
  status: "completed",
},
{
  orderName: "Про впровадження нової системи",
  orderNumber: "112-ОД",
  orderDate: "2024-04-20",
  measures: "Розробити методичні рекомендації",
  periodicity: "p_3",
  deadline: "2024-10-15",
  responsible: "Коваленко К.К.",
  direction: "Інше",
  customDirection: "Інформаційні технології",
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
