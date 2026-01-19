# OwO Distorted Checker

Discord Selfbot - Sends "owo distorted" message to specified channels every 10 minutes.

## Installation

```bash
git clone https://github.com/lawerth/owo-distorted-checker.git
cd owo-distorted-checker
npm install
```

## Usage

1. **Discord Token** - Add your Discord account token to `.env` file:
```
DISCORD_TOKEN=your_token_here
```

2. **Channel IDs** - Add channel IDs to the `channels` array in `config.json`:
```json
{
  "channels": [
    "1234567890",
    "0987654321",
    "5555555555"
  ],
  "interval": 600000,
  "message": "owo distorted"
}
```

3. **Start the bot**:
```bash
npm start
```

## How to Find Channel IDs?

1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on the channel
3. Click "Copy Channel ID"
4. Paste the ID into `config.json`

## ⚠️ Warning

- Selfbots violate Discord Terms of Service
- Use at your own risk
- Your Discord account should only be used for personal use