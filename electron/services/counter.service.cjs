const db = require('../db/db.cjs');
const log = require('../utils/logger.cjs');

function getCounter() {
    // log.debug("Get Counter Service Layer");
    const row = db.prepare('SELECT value FROM counters WHERE id = 1').get();
    return row?.value || 0;
}

function incrementCounter() {
    log.debug("Increament Counter Service Layer");
    const current = getCounter();
    const newValue = current + 1;
    db.prepare('INSERT OR REPLACE INTO counters (id, value) VALUES (1, ?)').run(newValue);
    log.info("Current Counter Value:", newValue);
    return newValue;
}

module.exports = {
    getCounter,
    incrementCounter
};
