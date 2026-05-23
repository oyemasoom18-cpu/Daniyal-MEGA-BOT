# SARDAR RDX BOT v2

## Overview
Advanced Facebook Messenger bot built with Node.js. Features a custom internal library (`rdx-fca`) for interacting with the Facebook Chat API, plus a web-based Control Panel for management.

## Architecture
- **`index.js`**: Master process controller — spawns and monitors `bot.js`, handles auto-restarts
- **`bot.js`**: Main bot entry point — initializes FCA connection, loads commands/events, starts web server
- **`server.js`**: Express web panel server on port 5000
- **`rdx-fca/`**: Custom internal Facebook Chat API module
- **`Sardar/commands/`**: 130+ bot command files
- **`Sardar/events/`**: 16 event handler files
- **`controller/`**: Database models (NeDB), request handlers, utility logging
- **`public/`**: Web Control Panel frontend (HTML/CSS/JS)
- **`bot_connect/`**: Facebook authentication (appstate.json or cookies.txt)

## Key Technologies
- Node.js 20, Express 4
- NeDB (file-based NoSQL database)
- rdx-fca (custom Facebook Chat API)
- node-cron (Islamic scheduler, auto-restarts)
- canvas / jimp (image processing)

## Running the App
The workflow runs `npm install && node index.js` and serves the web panel on port 5000.

## Configuration
- **`config.json`**: Main bot settings (BOTNAME, PREFIX, ADMINBOT, AI settings, etc.)
- **`AI_API_KEY`**: Should be stored as a Replit Secret, read via `process.env.AI_API_KEY`
- **`bot_connect/cookies.txt`** or **`bot_connect/appstate.json`**: Facebook login credentials

## User Preferences
- Language mix: Urdu/English (project uses both)
- Timezone: Asia/Karachi
- Do not rewrite from scratch — preserve existing structure
