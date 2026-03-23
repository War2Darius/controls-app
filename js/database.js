// ==================== РОБОТА З БАЗОЮ ДАНИХ ====================

// Створюємо базу даних
const db = new Dexie("ControlsDatabase");

// Визначаємо схему бази даних
db.version(2).stores({
  orders:
    "++id, orderName, orderNumber, orderDate, measures, periodicity, deadline, responsible, direction, status, customDirection, pdfBlob, pdfName",
});

// Клас для роботи з базою даних
class DatabaseService {
  // Отримати всі записи
  static async getAll() {
    return await db.orders.orderBy("deadline").toArray();
  }

  // Отримати запис за ID
  static async getById(id) {
    return await db.orders.get(id);
  }

  // Додати новий запис
  static async add(record) {
    return await db.orders.add(record);
  }

  // Оновити запис
  static async update(id, record) {
    return await db.orders.update(id, record);
  }

  // Видалити запис
  static async delete(id) {
    return await db.orders.delete(id);
  }

  // Видалити всі записи
  static async clear() {
    return await db.orders.clear();
  }

  // Отримати кількість записів
  static async count() {
    return await db.orders.count();
  }

  // Фільтрація записів
  static async filter(filterFn) {
    const all = await this.getAll();
    return all.filter(filterFn);
  }

  // Пошук за текстом
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

  // Отримати статистику
  static async getStats() {
    const all = await this.getAll();
    const today = new Date().toISOString().split("T")[0];
    const directions = getDirections();
    const statusLabels = window.getStatusLabels ? window.getStatusLabels() : window.STATUS_LABELS;
    const statusKeys = Object.keys(statusLabels);

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

    // Овердью рахуємо як записи з датою меньше сьогоднішньої і не виконані
    const overdueCount = all.filter(
      (r) => r.deadline < today && !statusKeys.includes(r.status),
    ).length;

    return {
      total: all.length,
      ...statusStats,
      overdue: overdueCount,

      // Напрямки (динамічно)
      ...directionStats,
    };
  }
}

// Експортуємо для використання
window.DB = {
  service: DatabaseService,
  instance: db,
};
