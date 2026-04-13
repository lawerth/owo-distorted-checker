const { Client } = require('discord.js-selfbot-v13');
const dotenv = require('dotenv');
const config = require('./config.json');
const { Logger } = require('./logger');
dotenv.config();

console.clear();

const log = new Logger('Selfbot');
const pkg = require('./package.json');
const client = new Client();
let isRunning = true;
let currentTimeout = null;

const sleep = (ms) => new Promise(r => { currentTimeout = setTimeout(r, ms); });

async function sendToChannel(channelId, index, total) {
  let channel;
  try {
    channel = await client.channels.fetch(channelId);
  } catch (err) {
    log.error(`Channel not found → ${channelId}: ${err.message}`);
    return;
  }

  try {
    await channel.send(config.message);
    log.cycle(index, total, `${channel.name} ${log._counters.total > 0 ? '' : ''}(${channel.guild.name})`);
  } catch (err) {
    log.error(`Failed to send → ${channelId}: ${err.message}`);
  }
}

async function startMessageCycles() {
  log.info('Sending initial messages...');
  log.blank();

  while (isRunning) {
    for (let i = 0; i < config.channels.length; i++) {
      if (!isRunning) return;
      await sendToChannel(config.channels[i], i, config.channels.length);

      if (i < config.channels.length - 1 && isRunning) {
        await sleep(10000);
      }
    }

    if (!isRunning) return;
    log.cycleDone(config.channels.length);

    if (isRunning) {
      await sleep(config.interval);
    }
  }
}

client.on('ready', () => {
  log.header(pkg.name, pkg.version);

  log.ready({
    'User': client.user.username,
    'Channels': config.channels.length,
    'Message': `"${config.message}"`,
    'Interval': `${config.interval / 60000} minutes`,
  });

  startMessageCycles();
});

client.on('shardDisconnect', () => {
  log.warn('Connection lost');
});

client.on('shardReconnecting', () => {
  log.reconnecting('Shard reconnecting...');
});

client.on('error', error => {
  log.error(`Client error: ${error.message}`);
});

process.on('unhandledRejection', error => {
  log.error(`Unhandled rejection: ${error.message}`);
});

process.on('SIGINT', () => {
  log.shutdown('SIGINT received');
  isRunning = false;
  if (currentTimeout) clearTimeout(currentTimeout);
  client.destroy();
  process.exit(0);
});

if (!process.env.DISCORD_TOKEN) {
  log.error('DISCORD_TOKEN is not defined in .env file!');
  process.exit(1);
}

log.info('Connecting to Discord...');

client.login(process.env.DISCORD_TOKEN).catch(err => {
  log.error(`Login failed: ${err.message}`);
  process.exit(1);
});
