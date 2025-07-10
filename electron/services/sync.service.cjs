const log = require('../utils/logger.cjs');

async function syncData() {
  log.info('[syncService] Starting data sync...');
  
  // Simulate async work
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  log.info('[syncService] Data sync completed');
}

module.exports = { syncData };
