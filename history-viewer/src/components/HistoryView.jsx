import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function HistoryView({ tickers, apiKey, baseUrl, rangeMinutes, polling }) {
  const [allData, setAllData] = useState({})   // ticker -> tick[]
  const [lastPoll, setLastPoll] = useState(null)
  const timerRef = useRef(null)

  const cutoff = Date.now() - rangeMinutes * 60 * 1000

  const fetchLatest = useCallback(async () => {
    try {
      const params = tickers.map((t) => `ticker=${t}`).join('&')
      const resp = await fetch(`${baseUrl}/api/latest?${params}`, {
        headers: { 'X-API-Key': apiKey },
      })
      const json = await resp.json()
      if (!json.data) return

      setAllData((prev) => {
        const next = { ...prev }
        json.data.forEach((tick) => {
          const arr = next[tick.ticker] || []
          // Avoid duplicates by seq
          if (!arr.some((d) => d.seq === tick.seq)) {
            next[tick.ticker] = [...arr, tick]
          }
        })
        return next
      })
      setLastPoll(new Date())
    } catch (err) {
      console.error('Poll error:', err)
    }
  }, [tickers, apiKey, baseUrl])

  useEffect(() => {
    if (polling) {
      fetchLatest()
      timerRef.current = setInterval(fetchLatest, 10000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [polling, fetchLatest])

  const download = (fmt) => {
    const rows = []
    tickers.forEach((t) => {
      const ticks = (allData[t] || []).filter((d) => new Date(d.ts).getTime() >= cutoff)
      ticks.forEach((d) => rows.push(d))
    })

    if (fmt === 'csv') {
      const header = 'ticker,ts,price,currency,volume,seq'
      const lines = rows.map((r) => `${r.ticker},${r.ts},${r.price},${r.currency},${r.volume},${r.seq}`)
      const csv = [header, ...lines].join('\n')
      downloadFile(csv, 'stock_history.csv', 'text/csv')
    } else {
      const json = JSON.stringify(rows, null, 2)
      downloadFile(json, 'stock_history.json', 'application/json')
    }
  }

  return (
    <div>
      {polling && <p className="poll-status">🔄 Polling every 10s…</p>}
      {lastPoll && <p className="poll-status">Last poll: {lastPoll.toLocaleTimeString()}</p>}

      {tickers.map((ticker) => {
        const ticks = (allData[ticker] || []).filter((d) => new Date(d.ts).getTime() >= cutoff)
        if (ticks.length === 0) return null

        return (
          <div key={ticker} className="results-section">
            <div className="results-header">
              <h2>{ticker} — {ticks.length} ticks</h2>
              <div className="export-btns">
                <button onClick={() => downloadSingle(ticks, 'csv', ticker)}>⬇ CSV</button>
                <button onClick={() => downloadSingle(ticks, 'json', ticker)}>⬇ JSON</button>
              </div>
            </div>

            <div className="chart-container">
              <Line
                data={{
                  labels: ticks.map((d) =>
                    new Date(d.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  ),
                  datasets: [
                    {
                      label: `${ticker} Price`,
                      data: ticks.map((d) => d.price),
                      borderColor: '#a78bfa',
                      backgroundColor: 'rgba(167, 139, 250, 0.1)',
                      fill: true,
                      tension: 0.3,
                      pointRadius: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: true, labels: { color: '#94a3b8' } } },
                  scales: {
                    x: { ticks: { color: '#64748b', maxTicksLimit: 8, font: { size: 10 } }, grid: { color: '#1a2332' } },
                    y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1a2332' } },
                  },
                }}
              />
            </div>

            <table className="data-table">
              <thead>
                <tr><th>Time</th><th>Price</th><th>Currency</th><th>Volume</th><th>Seq</th></tr>
              </thead>
              <tbody>
                {ticks.slice().reverse().map((d, i) => (
                  <tr key={i}>
                    <td>{new Date(d.ts).toLocaleString()}</td>
                    <td>{d.price.toFixed(2)}</td>
                    <td>{d.currency}</td>
                    <td>{d.volume}</td>
                    <td>{d.seq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}

      {tickers.length > 0 && (
        <div className="results-section" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 12 }}>Export All Selected Tickers</h2>
          <div className="export-btns">
            <button onClick={() => download('csv')}>⬇ Download All as CSV</button>
            <button onClick={() => download('json')}>⬇ Download All as JSON</button>
          </div>
        </div>
      )}
    </div>
  )
}

function downloadSingle(ticks, fmt, ticker) {
  if (fmt === 'csv') {
    const header = 'ticker,ts,price,currency,volume,seq'
    const lines = ticks.map((r) => `${r.ticker},${r.ts},${r.price},${r.currency},${r.volume},${r.seq}`)
    const csv = [header, ...lines].join('\n')
    downloadFile(csv, `${ticker}_history.csv`, 'text/csv')
  } else {
    downloadFile(JSON.stringify(ticks, null, 2), `${ticker}_history.json`, 'application/json')
  }
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
