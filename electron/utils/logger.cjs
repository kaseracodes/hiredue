const log = require('electron-log');
const path = require('path');
const fs = require('fs');

const logPath = log.transports.file.getFile?.().path ?? 'log-fallback.log';
// console.log('Log file path:', logPath);

if (!fs.existsSync(path.dirname(logPath))) {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
}

log.transports.file.resolvePathFn = () => logPath;
log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB max size before rotation
log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s} [{level}] {text}';

// Add file + line info to log
function getCallerInfo() {
  const originalStack = new Error().stack?.split('\n') ?? [];
  
  // Skip the first 2-3 lines (error message + logger function call)
  const callerStackLine = originalStack.find(line =>
    line.includes('at') && !line.includes('logger.cjs') // filter out internal logger calls
  );

  if (!callerStackLine) return 'unknown';

  // Match the file path, line and column (with or without wrapping parentheses)
  const match = callerStackLine.match(/(?:at\s+.*?\()?([A-Z]:\\.*?):(\d+):(\d+)\)?/i);
  if (!match) return 'unknown';

  const filePath = match[1];
  const line = match[2];
  return `${filePath}:${line}`;
}

// Pretty-format objects & support multiple args
function formatArgs(args) {
  return args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
}

function logWithOrigin(level, ...args) {
  const origin = getCallerInfo();
  log[level](`[${origin}] ${formatArgs(args)}`);
}

// main process -- logs with file name and line number
// renderer process - logs without filename or line number
module.exports = {
  // Use these in Electron code
  info: (...args) => logWithOrigin('info', ...args),
  warn: (...args) => logWithOrigin('warn', ...args),
  error: (...args) => logWithOrigin('error', ...args),
  debug: (...args) => logWithOrigin('debug', ...args),

  // Use these in main to log renderer events
  raw: {
    info: (...args) => log.info('[Renderer]', ...args),
    warn: (...args) => log.warn('[Renderer]', ...args),
    error: (...args) => log.error('[Renderer]', ...args),
    debug: (...args) => log.debug('[Renderer]', ...args),
  }
};
