const taskManager = require('./taskManager.cjs');

function initScheduler() {
  taskManager.loadTasks();
  taskManager.startAutoTasks();
}

module.exports = {
  initScheduler,
  ...taskManager
};
