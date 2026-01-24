const { Client } = require('discord.js-selfbot-v13');
const dotenv = require('dotenv');
const config = require('./config.json');

dotenv.config();

const client = new Client();
let messageIntervals = [];

client.on('ready', () => {
  console.log(`\n✓ Logged in as ${client.user.username}`);
  console.log(`✓ Will send messages to ${config.channels.length} channels`);
  console.log(`✓ Sending "${config.message}" every ${config.interval / 60000} minutes\n`);

  messageIntervals.forEach(interval => clearInterval(interval));
  messageIntervals = [];

  config.channels.forEach((channelId, index) => {
    const intervalId = setInterval(() => {
      client.channels.fetch(channelId)
        .then(channel => {
          channel.send(config.message)
            .then(() => {
              const now = new Date().toLocaleString('en-US');
              console.log(`[${now}] ✓ ${channel.name} (${channel.guild.name})`);
              if (index === config.channels.length - 1) {
                console.log('-----------------------------');
              }
            })
            .catch(err => {
              const now = new Date().toLocaleString('en-US');
              console.error(`[${now}] ✗ Failed to send message: ${err.message}`);
            });
        })
        .catch(err => {
          const now = new Date().toLocaleString('en-US');
          console.error(`[${now}] ✗ Channel not found (${channelId}): ${err.message}`);
        });
    }, config.interval + (index * 10000));

    messageIntervals.push(intervalId);
  });

  console.log('→ Sending initial messages...\n');
  config.channels.forEach((channelId, index) => {
    setTimeout(() => {
      client.channels.fetch(channelId)
        .then(channel => {
          channel.send(config.message)
            .then(() => {
              const now = new Date().toLocaleString('en-US');
              console.log(`[${now}] ✓ ${channel.name} (${channel.guild.name})`);
              if (index === config.channels.length - 1) {
                console.log('-----------------------------');
              }
            })
            .catch(err => {
              const now = new Date().toLocaleString('en-US');
              console.error(`[${now}] ✗ Failed to send message: ${err.message}`);
            });
        })
        .catch(err => {
          const now = new Date().toLocaleString('en-US');
          console.error(`[${now}] ✗ Channel not found (${channelId}): ${err.message}`);
        });
    }, index * 10000);
  });
});

client.on('shardDisconnect', () => {
  console.log('\n⚠ Connection lost, reconnecting...');
});

client.on('shardReconnecting', () => {
  console.log('→ Reconnecting...');
});

client.on('error', error => {
  console.error('✗ Client error:', error.message);
});

process.on('unhandledRejection', error => {
  console.error('✗ Unhandled error:', error.message);
});

process.on('SIGINT', () => {
  console.log('\n\n⊗ Shutting down bot...');
  messageIntervals.forEach(interval => clearInterval(interval));
  client.destroy();
  process.exit(0);
});

if (!process.env.DISCORD_TOKEN) {
  console.error('✗ ERROR: DISCORD_TOKEN is not defined in .env file!');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('✗ Failed to login:', err.message);
  process.exit(1);
});
