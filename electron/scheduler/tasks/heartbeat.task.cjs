const log = require('../../utils/logger.cjs');

module.exports = {
    name: 'heartbeat',
    autoStart: true,
    cron: '*/30 * * * * *',
    run: async () => {
      log.info('[heartbeat] Still alive at', new Date().toISOString());
    }
  };
  