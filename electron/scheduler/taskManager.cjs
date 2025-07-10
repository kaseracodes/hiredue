const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

const log = require('../utils/logger.cjs');

const tasksDir = path.join(__dirname, 'tasks');
const tasks = new Map();       // name -> task definition
const jobs = new Map();        // name -> cron job

function loadTasks() {
  const files = fs.readdirSync(tasksDir);
  for (const file of files) {
    const task = require(path.join(tasksDir, file));
    tasks.set(task.name, task);
  }
}

function startTask(taskName) {
  const task = tasks.get(taskName);
  if (!task || jobs.has(taskName)) return;

  const job = cron.schedule(task.cron, task.run);
  job.start();
  jobs.set(taskName, job);
  log.info(`[taskManager] Started task: ${taskName}`);
}

function stopTask(taskName) {
  const job = jobs.get(taskName);
  if (job) {
    job.stop();
    jobs.delete(taskName);
    log.info(`[taskManager] Stopped task: ${taskName}`);
  }
}

function isRunning(taskName) {
  return jobs.has(taskName);
}

function startAutoTasks() {
  for (const [name, task] of tasks) {
    if (task.autoStart) {
      startTask(name);
    }
  }
}

function getStatus() {
  return Array.from(tasks.keys()).map(name => ({
    name,
    running: isRunning(name),
    autoStart: tasks.get(name).autoStart,
    cron: tasks.get(name).cron
  }));
}

module.exports = {
  loadTasks,
  startTask,
  stopTask,
  getStatus,
  startAutoTasks
};
