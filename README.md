# Real-Time Stock Data Project (Kafka/SSE)

University assignment for consuming real-time and recent stock data from a Kafka-backed SSE API.

## Project Structure

- `realtime-dashboard/` — Live dashboard app that connects to `/api/stream` via Server-Sent Events (SSE) and displays live stock price updates with Chart.js charts and connection management.
- `history-viewer/` — Recent data viewer/downloader app that polls `/api/latest`, shows recent stock data in charts and tables, and supports saving as CSV or JSON.
- `screenshots/` — Assignment screenshots.

## Tech Stack

- **Frontend:** React + Vite
- **Charts:** Chart.js + react-chartjs-2
- **Real-time:** Server-Sent Events (EventSource API)
- **Data polling:** fetch with setInterval (10 s cadence)
- **Styling:** Custom CSS (dark theme)

## API Configuration

- Base URL: `https://add.piotrkojalowicz.dev`
- Authentication header: `X-API-Key` (or `api_key` query param for SSE)
- Environment variable: `VITE_API_KEY`

Each app has its own `.env` file (excluded from git). Copy `.env.example` → `.env` and set your key:

```bash
cp realtime-dashboard/.env.example realtime-dashboard/.env
cp history-viewer/.env.example history-viewer/.env
# edit both .env files and set VITE_API_KEY
```

## Running the Apps

```bash
# App #1 — Realtime Dashboard
cd realtime-dashboard
npm install
npm run dev          # → http://localhost:5173

# App #2 — History Viewer
cd history-viewer
npm install
npm run dev          # → http://localhost:5173 (or 5174 if App #1 is already running)
```

## Endpoints Used

| Endpoint | Method | Description |
|---|---|---|
| `/api/tickers` | GET | List of 50 available stock tickers |
| `/api/stream?ticker=SYMBOL` | GET (SSE) | Real-time price events (~1/sec per ticker) |
| `/api/latest?ticker=SYMBOL` | GET | Latest price snapshot per ticker |

## Screenshots

See the `screenshots/` folder.
