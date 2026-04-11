const { Client } = require('discord.js-selfbot-v13');
const dotenv = require('dotenv');
const config = require('./config.json');
const { Logger } = require('./logger');
dotenv.config();

const log = new Logger('Bot');
const pkg = require('./package.json');
const client = new Client();
let messageIntervals = [];

function sendToChannel(channelId, index, total) {
  return client.channels.fetch(channelId)
    .then(channel => {
      return channel.send(config.message)
        .then(() => {
          log.cycle(index, total, `${channel.name} ${log._counters.total > 0 ? '' : ''}(${channel.guild.name})`);
          if (index === total - 1) {
            log.cycleDone(total);
          }
        })
        .catch(err => {
          log.error(`Failed to send → ${channelId}: ${err.message}`);
        });
    })
    .catch(err => {
      log.error(`Channel not found → ${channelId}: ${err.message}`);
    });
}

client.on('ready', () => {
  log.header(pkg.name, pkg.version);

  log.ready({
    'User': client.user.username,
    'Channels': config.channels.length,
    'Message': `"${config.message}"`,
    'Interval': `${config.interval / 60000} minutes`,
  });

  messageIntervals.forEach(interval => clearInterval(interval));
  messageIntervals = [];

  config.channels.forEach((channelId, index) => {
    const intervalId = setInterval(() => {
      sendToChannel(channelId, index, config.channels.length);
    }, config.interval + (index * 10000));

    messageIntervals.push(intervalId);
  });

  log.info('Sending initial messages...');
  log.blank();

  config.channels.forEach((channelId, index) => {
    setTimeout(() => {
      sendToChannel(channelId, index, config.channels.length);
    }, index * 10000);
  });
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
  messageIntervals.forEach(interval => clearInterval(interval));
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
