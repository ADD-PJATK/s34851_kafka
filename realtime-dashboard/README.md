# Realtime Stock Dashboard (App #1)

Live SSE-powered dashboard displaying real-time stock price updates for selected companies.

## Prerequisites

- **Node.js** ≥ 18 (with npm)

## Installation

```bash
cd realtime-dashboard
npm install
```

## Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set your API key:
   ```
   VITE_API_KEY=your_api_key_here
   ```
   Get your key at: https://add.piotrkojalowicz.dev/ (password: `A@d-$01`)

## How to Run

```bash
npm run dev
```

The app opens at **http://localhost:5173** (default Vite port).

## Endpoints Used

| Endpoint | Usage |
|---|---|
| `GET /api/tickers` | Fetches the full list of 50 companies on app load |
| `GET /api/stream?ticker=ACME` | SSE connection per selected ticker — receives live `tick` events (~1/sec) |

Authentication is via the `api_key` query parameter (appended automatically by `EventSource`).

## Features

- Select one or more tickers from the 50-company list
- Live price chart (last 30 ticks) using Chart.js
- Connection status indicator (connected / disconnected / connecting)
- Auto-reconnect on connection drops
- Expandable history table per ticker

## Screenshots

See the `screenshots/` folder at the repository root.
