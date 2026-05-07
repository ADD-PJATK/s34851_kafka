# History Downloader / Viewer (App #2)

Fetch recent stock data from the API, display it in charts and tables, and export to CSV or JSON.

## Prerequisites

- **Node.js** ≥ 18 (with npm)

## Installation

```bash
cd history-viewer
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
| `GET /api/latest?ticker=ACME&ticker=ALFA` | Polled every 10 seconds while polling is active — returns latest tick per ticker |

Authentication is via the `X-API-Key` header.

## Features

- Select one or more tickers from the 50-company list
- Choose a time range (1–10 minutes)
- Start/stop polling with a button (polls every 10s)
- Price history chart per ticker using Chart.js
- Full data table with timestamps, prices, volumes
- Export individual tickers or all selected as **CSV** or **JSON**

## Screenshots

See the `screenshots/` folder at the repository root.
