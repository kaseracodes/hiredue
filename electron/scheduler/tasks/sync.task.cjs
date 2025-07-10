const syncService = require('../../services/sync.service.cjs');
const log = require('../../utils/logger.cjs');

module.exports = {
  name: 'sync',
  autoStart: false,
  cron: '*/10 * * * * *',
  run: async () => {
    log.info('[syncTask] Running...');
    await syncService.syncData();
  }
};
