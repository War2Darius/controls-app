// ==================== ТЕСТОВІ ДАНІ ====================

// Тестові дані для розробки
const TEST_DATA = [
  {

];

// Функція для додавання тестових даних
async function addTestDataIfNeeded(db) {
  try {
    const count = await db.orders.count();

    if (count === 0) {
      console.log("Додаю тестові дані...");
      await db.orders.bulkAdd(TEST_DATA);
      console.log("Тестові дані додано успішно");
      return false;
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
