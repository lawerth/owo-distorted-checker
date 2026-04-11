const chalk = require('chalk');

// Color Palette
const colors = {
  timestamp: chalk.gray,
  label: chalk.bold,
  info: chalk.cyan,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  debug: chalk.magenta,
  dim: chalk.dim,
  accent: chalk.hex('#A78BFA'),  // Soft purple
  highlight: chalk.hex('#60A5FA'),  // Soft blue
  muted: chalk.hex('#6B7280'),  // Gray-500
  divider: chalk.hex('#374151'),  // Gray-700
};

// Symbols
const symbols = {
  success: chalk.green('✔'),
  error: chalk.red('✖'),
  warn: chalk.yellow('⚠'),
  info: chalk.cyan('ℹ'),
  debug: chalk.magenta('⚙'),
  arrow: chalk.dim('→'),
  dot: chalk.dim('·'),
  line: chalk.hex('#374151')('─'),
  block: chalk.dim('│'),
};

// Utilities
function getTimestamp() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return colors.timestamp(`${h}:${m}:${s}`);
}

function getDateTimestamp() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return colors.timestamp(`${d}/${mo}/${y} ${h}:${m}:${s}`);
}

function divider(char = '─', length = 50) {
  console.log(colors.divider(char.repeat(length)));
}

function pad(str, len = 8) {
  return str.padEnd(len);
}

// Logger Class
class Logger {
  constructor(prefix = '') {
    this.prefix = prefix ? colors.accent(`[${prefix}]`) + ' ' : '';
    this._startTime = Date.now();
    this._counters = { success: 0, error: 0, warn: 0, total: 0 };
  }

  // Core log methods
  info(message, ...args) {
    const tag = colors.info(pad('INFO'));
    console.log(`  ${getTimestamp()}  ${tag}  ${this.prefix}${message}`, ...args);
  }

  success(message, ...args) {
    this._counters.success++;
    this._counters.total++;
    const tag = colors.success(pad('OK'));
    console.log(`  ${getTimestamp()}  ${tag}  ${this.prefix}${symbols.success} ${message}`, ...args);
  }

  warn(message, ...args) {
    this._counters.warn++;
    this._counters.total++;
    const tag = colors.warn(pad('WARN'));
    console.log(`  ${getTimestamp()}  ${tag}  ${this.prefix}${symbols.warn} ${message}`, ...args);
  }

  error(message, ...args) {
    this._counters.error++;
    this._counters.total++;
    const tag = colors.error(pad('ERROR'));
    console.error(`  ${getTimestamp()}  ${tag}  ${this.prefix}${symbols.error} ${message}`, ...args);
  }

  debug(message, ...args) {
    if (process.env.DEBUG) {
      const tag = colors.debug(pad('DEBUG'));
      console.log(`  ${getTimestamp()}  ${tag}  ${this.prefix}${symbols.debug} ${colors.dim(message)}`, ...args);
    }
  }

  // Formatted outputs
  table(label, data) {
    this.info(colors.label(label));
    const maxKeyLen = Math.max(...Object.keys(data).map(k => k.length));
    for (const [key, value] of Object.entries(data)) {
      const paddedKey = colors.muted(key.padEnd(maxKeyLen));
      console.log(`             ${symbols.block}  ${paddedKey}  ${symbols.dot}  ${colors.highlight(String(value))}`);
    }
  }

  divider() {
    divider();
  }

  blank() {
    console.log('');
  }

  // Cycle logger (for repeated actions)
  cycle(index, total, message) {
    const progress = colors.muted(`[${index + 1}/${total}]`);
    const tag = colors.success(pad('SENT'));
    console.log(`  ${getTimestamp()}  ${tag}  ${this.prefix}${progress} ${message}`);
  }

  cycleDone(total) {
    const tag = colors.dim(pad(''));
    console.log(`  ${getTimestamp()}  ${tag}  ${this.prefix}${colors.dim(`── Cycle complete (${total} channels) ──`)}`);
  }

  // App lifecycle
  header(appName, version) {
    console.log('');
    divider('━', 50);
    console.log('');
    console.log(`   ${colors.accent('◆')}  ${chalk.bold.white(appName)}  ${colors.muted(`v${version}`)}`);
    console.log(`   ${colors.muted('   Started at')} ${getDateTimestamp()}`);
    console.log('');
    divider('━', 50);
    console.log('');
  }

  ready(details) {
    const tag = colors.success(pad('READY'));
    console.log(`  ${getTimestamp()}  ${tag}  ${this.prefix}${chalk.bold.green('Bot is online and ready')}`);
    if (details) {
      for (const [key, value] of Object.entries(details)) {
        console.log(`             ${symbols.block}  ${colors.muted(key)}  ${symbols.arrow}  ${colors.highlight(String(value))}`);
      }
    }
    console.log('');
  }

  shutdown(reason = 'User requested shutdown') {
    console.log('');
    const tag = colors.warn(pad('STOP'));
    console.log(`  ${getTimestamp()}  ${tag}  ${this.prefix}${chalk.bold.yellow('Shutting down...')}`);
    console.log(`             ${symbols.block}  ${colors.muted('Reason')}  ${symbols.arrow}  ${reason}`);

    const uptime = this._formatUptime(Date.now() - this._startTime);
    console.log(`             ${symbols.block}  ${colors.muted('Uptime')}  ${symbols.arrow}  ${uptime}`);
    console.log(`             ${symbols.block}  ${colors.muted('Stats')}   ${symbols.arrow}  ${colors.success(this._counters.success + ' ok')} ${colors.dim('/')} ${colors.error(this._counters.error + ' err')} ${colors.dim('/')} ${colors.warn(this._counters.warn + ' warn')}`);
    console.log('');
    divider('━', 50);
    console.log('');
  }

  reconnecting(event) {
    const tag = colors.warn(pad('RECONN'));
    console.log(`  ${getTimestamp()}  ${tag}  ${this.prefix}${symbols.warn} ${colors.yellow(event || 'Attempting to reconnect...')}`);
  }

  // Private helpers
  _formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours % 24 > 0) parts.push(`${hours % 24}h`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
    parts.push(`${seconds % 60}s`);

    return colors.highlight(parts.join(' '));
  }
}

module.exports = { Logger, colors, symbols };
