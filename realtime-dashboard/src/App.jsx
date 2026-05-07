import { useState, useEffect } from 'react'
import TickerSelector from './components/TickerSelector'
import LiveFeed from './components/LiveFeed'
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
        <h1>📈 Realtime Stock Dashboard</h1>
        <p className="subtitle">Live SSE price feed — select tickers below</p>
      </header>

      <TickerSelector
        tickers={tickers}
        selected={selected}
        onToggle={toggle}
      />

      {selected.length > 0 ? (
        <LiveFeed tickers={selected} apiKey={API_KEY} baseUrl={BASE} />
      ) : (
        <p className="hint">Select one or more tickers to start receiving live data.</p>
      )}
    </div>
  )
}
