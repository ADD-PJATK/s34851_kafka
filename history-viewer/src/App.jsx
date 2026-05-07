import { useState, useEffect } from 'react'
import TickerSelector from './components/TickerSelector'
import HistoryView from './components/HistoryView'
import './App.css'

const API_KEY = import.meta.env.VITE_API_KEY
const BASE = ''

const FALLBACK_TICKERS = [
  { ticker: 'ACME' }, { ticker: 'ALFA' }, { ticker: 'BETA' }, { ticker: 'CASH' },
  { ticker: 'CLOUD' }, { ticker: 'COAL' }, { ticker: 'COPR' }, { ticker: 'DATA' },
  { ticker: 'DEVS' }, { ticker: 'DRON' }, { ticker: 'ECO' }, { ticker: 'EDU' },
  { ticker: 'ENRG' }, { ticker: 'FARM' }, { ticker: 'FINX' }, { ticker: 'FOOD' },
  { ticker: 'FUEL' }, { ticker: 'GAME' }, { ticker: 'GRIN' }, { ticker: 'HEAL' },
  { ticker: 'HOME' }, { ticker: 'HYPE' }, { ticker: 'INSR' }, { ticker: 'IOT' },
  { ticker: 'JET' }, { ticker: 'LABS' }, { ticker: 'LEND' }, { ticker: 'LOGI' },
  { ticker: 'MALL' }, { ticker: 'MEDI' }, { ticker: 'META' }, { ticker: 'MOBI' },
  { ticker: 'MOVE' }, { ticker: 'NET' }, { ticker: 'NOVA' }, { ticker: 'OILS' },
  { ticker: 'PARK' }, { ticker: 'PHAR' }, { ticker: 'PLNT' }, { ticker: 'PROD' },
  { ticker: 'QBIT' }, { ticker: 'RAIL' }, { ticker: 'ROBO' }, { ticker: 'SAFE' },
  { ticker: 'SHIP' }, { ticker: 'SHOP' }, { ticker: 'SOLR' }, { ticker: 'TEL' },
  { ticker: 'TRVL' }, { ticker: 'WATR' },
]

export default function App() {
  const [tickers, setTickers] = useState(FALLBACK_TICKERS)
  const [selected, setSelected] = useState([])
  const [rangeMinutes, setRangeMinutes] = useState(5)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    fetch(`${BASE}/api/tickers`, {
      headers: { 'X-API-Key': API_KEY },
    })
      .then((r) => r.json())
      .then((data) => { if (data.tickers?.length) setTickers(data.tickers) })
      .catch(() => {})
  }, [])

  const toggle = (t) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))

  return (
    <div className="app">
      <header>
        <h1>📊 History Downloader / Viewer</h1>
        <p className="subtitle">Fetch recent stock data, view charts, and export to CSV/JSON</p>
      </header>

      <TickerSelector
        tickers={tickers}
        selected={selected}
        onToggle={toggle}
      />

      <div className="controls">
        <label>
          Time range:
          <select value={rangeMinutes} onChange={(e) => setRangeMinutes(Number(e.target.value))}>
            {[1, 2, 3, 5, 7, 10].map((m) => (
              <option key={m} value={m}>Last {m} min</option>
            ))}
          </select>
        </label>
        <button
          className={polling ? 'btn-stop' : 'btn-start'}
          onClick={() => setPolling(!polling)}
          disabled={selected.length === 0}
        >
          {polling ? '⏹ Stop Polling' : '▶ Start Polling'}
        </button>
      </div>

      {selected.length > 0 ? (
        <HistoryView
          tickers={selected}
          apiKey={API_KEY}
          baseUrl={BASE}
          rangeMinutes={rangeMinutes}
          polling={polling}
        />
      ) : (
        <p className="hint">Select one or more tickers above to get started.</p>
      )}
    </div>
  )
}
