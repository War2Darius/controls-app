// ==================== ТЕСТОВІ ДАНІ ====================

// Тестові дані для пустої таблиці
const TEST_DATA = [
  {
    orderName: "Про затвердження плану заходів з охорони праці",
    orderNumber: "123-ОД",
    orderDate: "2025-01-15",
    measures: "Провести інструктаж з охорони праці для всіх працівників",
    periodicity: "p_4",
    deadline: "2026-03-25",
    responsible: "Петренко П.П.",
    direction: "Службова діяльність",
    status: "in-progress",
  },
  {
    orderName: "Про перевірку знань з питань пожежної безпеки",
    orderNumber: "045-ПБ",
    orderDate: "2025-02-20",
    measures: "Організувати перевірку знань працівників у сфері пожежної безпеки",
    periodicity: "p_5",
    deadline: "2026-04-10",
    responsible: "Сидоренко С.С.",
    direction: "Піротехніка",
    status: "pending",
  },
  {
    orderName: "Про поводження з небезпечними хімічними речовинами",
    orderNumber: "078-ХІМ",
    orderDate: "2025-03-05",
    measures: "Забезпечити належне зберігання та утилізацію хімічних відходів",
    periodicity: "p_2",
    deadline: "2026-03-28",
    responsible: "Коваленко К.К.",
    direction: "Хімія",
    status: "pending",
  },
  {
    orderName: "Про проведення щоквартального аудиту",
    orderNumber: "012-АУД",
    orderDate: "2025-01-10",
    measures: "Провести внутрішній аудит системи управління охороною праці",
    periodicity: "p_5",
    deadline: "2025-12-15",
    responsible: "Бондаренко Б.Б.",
    direction: "Службова діяльність",
    status: "completed",
  },
  {
    orderName: "Про оновлення документації з охорони праці",
    orderNumber: "156-ОХ",
    orderDate: "2025-04-01",
    measures: "Переглянути та актуалізувати інструкції з охорони праці",
    periodicity: "p_7",
    deadline: "2026-06-30",
    responsible: "Шевченко Ш.Ш.",
    direction: "Службова діяльність",
    status: "in-progress",
  },
  {
    orderName: "Про перевірку вогнегасників",
    orderNumber: "023-ВГ",
    orderDate: "2025-03-15",
    measures: "Провести технічне обслуговування вогнегасників",
    periodicity: "p_4",
    deadline: "2026-04-20",
    responsible: "Козак К.К.",
    direction: "Піротехніка",
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
