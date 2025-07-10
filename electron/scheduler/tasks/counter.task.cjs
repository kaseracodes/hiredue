const { incrementCounter } = require('../../services/counter.service.cjs');
const log = require('../../utils/logger.cjs');

module.exports = {
  name: 'counter',
  autoStart: true,
  cron: '*/4 * * * * *',
  run: async () => {
    log.info('[counterTask] Running...');
    incrementCounter();
  }
};
