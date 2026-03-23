// ==================== РОБОТА З БАЗОЮ ДАНИХ ====================

// Створюємо базу даних
const db = new Dexie("ControlsDatabase");

// Визначаємо схему бази даних
db.version(2).stores({
  orders:
  "++id, orderName, orderNumber, orderDate, measures, periodicity, deadline, responsible, direction, status, customDirection, pdfBlob, pdfName",
});

/**
 * Клас для роботи з базою даних
 */
class DatabaseService {
  /**
   * Отримати всі записи, відсортовані за терміном виконання
   * @returns {Promise<Array>} Масив записів
   */
  static async getAll() {
    return await db.orders.orderBy("deadline").toArray();
  }

  /**
   * Отримати запис за ID
   * @param {number} id - ID запису
   * @returns {Promise<Object>} Запис
   */
  static async getById(id) {
    return await db.orders.get(id);
  }

  /**
   * Додати новий запис
   * @param {Object} record - Дані запису
   * @returns {Promise<number>} ID доданого запису
   */
  static async add(record) {
    return await db.orders.add(record);
  }

  /**
   * Оновити запис
   * @param {number} id - ID запису
   * @param {Object} record - Нові дані
   * @returns {Promise<number>} Кількість оновлених записів
   */
  static async update(id, record) {
    return await db.orders.update(id, record);
  }

  /**
   * Видалити запис
   * @param {number} id - ID запису
   * @returns {Promise<void>}
   */
  static async delete(id) {
    return await db.orders.delete(id);
  }

  /**
   * Видалити всі записи
   * @returns {Promise<void>}
   */
  static async clear() {
    return await db.orders.clear();
  }

  /**
   * Отримати кількість записів
   * @returns {Promise<number>}
   */
  static async count() {
    return await db.orders.count();
  }

  /**
   * Фільтрація записів за функцією
   * @param {Function} filterFn - Функція фільтрації
   * @returns {Promise<Array>}
   */
  static async filter(filterFn) {
    const all = await this.getAll();
    return all.filter(filterFn);
  }

  /**
   * Пошук за текстом у кількох полях
   * @param {string} searchTerm - Пошуковий запит
   * @returns {Promise<Array>}
   */
  static async search(searchTerm) {
    const all = await this.getAll();
    const term = searchTerm.toLowerCase();

    return all.filter(
      (row) =>
      (row.orderName && row.orderName.toLowerCase().includes(term)) ||
      (row.orderNumber && row.orderNumber.toLowerCase().includes(term)) ||
      (row.responsible && row.responsible.toLowerCase().includes(term)) ||
      (row.measures && row.measures.toLowerCase().includes(term)) ||
      (row.direction && row.direction.toLowerCase().includes(term)) ||
      (row.periodicity && row.periodicity.toLowerCase().includes(term)),
    );
  }

  /**
   * Отримати статистику записів
   * @returns {Promise<Object>} Об'єкт зі статистикою
   */
  static async getStats() {
    const all = await this.getAll();
    const today = new Date().toISOString().split("T")[0];
    const directions = getDirections();
    const statusLabels = window.getStatusLabels ? window.getStatusLabels() : window.STATUS_LABELS;
    const statusKeys = Object.keys(statusLabels);

    // Статус "Виконано" - останній у списку (за замовчуванням completed)
    const completedStatus = statusKeys[statusKeys.length - 1];

    // Підрахунок за напрямками
    const directionStats = {};
    directions.forEach(dir => {
      directionStats[dir] = all.filter(r => r.direction === dir).length;
    });

    // Підрахунок за статусами
    const statusStats = {};
    statusKeys.forEach(key => {
      statusStats[key] = all.filter(r => r.status === key).length;
    });

    // ВИПРАВЛЕНО: прострочені - дата меньше сьогоднішньої і статус не "Виконано"
    const overdueCount = all.filter(
      (r) => r.deadline < today && r.status !== completedStatus,
    ).length;

    return {
      total: all.length,
      ...statusStats,
      overdue: overdueCount,
      ...directionStats,
    };
  }
}

// Експортуємо для використання
window.DB = {
  service: DatabaseService,
  instance: db,
};
