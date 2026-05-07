import { useState, useEffect, useRef } from 'react'
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

const MAX_HISTORY = 30

export default function LiveFeed({ tickers, apiKey, baseUrl }) {
  const [data, setData] = useState({})       // ticker -> { current, history: [], status }
  const sourcesRef = useRef({})

  useEffect(() => {
    // Connect SSE for each selected ticker
    tickers.forEach((ticker) => {
      if (sourcesRef.current[ticker]) return

      const url = `${baseUrl}/api/stream?ticker=${ticker}&api_key=${apiKey}`
      const es = new EventSource(url)
      sourcesRef.current[ticker] = es

      es.addEventListener('tick', (e) => {
        try {
          const tick = JSON.parse(e.data)
          setData((prev) => {
            const entry = prev[ticker] || { current: null, history: [], status: 'connected' }
            const history = [...entry.history, tick].slice(-MAX_HISTORY)
            return { ...prev, [ticker]: { current: tick, history, status: 'connected' } }
          })
        } catch (err) {
          console.error('Parse error', err)
        }
      })

      es.onerror = () => {
        setData((prev) => ({
          ...prev,
          [ticker]: { ...(prev[ticker] || {}), status: 'disconnected' },
        }))
        es.close()
        delete sourcesRef.current[ticker]
        // Auto-reconnect after 3s
        setTimeout(() => {
          delete sourcesRef.current[ticker]
        }, 3000)
      }

      setData((prev) => ({
        ...prev,
        [ticker]: { ...(prev[ticker] || {}), status: 'connecting' },
      }))
    })

    // Clean up removed tickers
    Object.keys(sourcesRef.current).forEach((t) => {
      if (!tickers.includes(t)) {
        sourcesRef.current[t].close()
        delete sourcesRef.current[t]
        setData((prev) => {
          const next = { ...prev }
          delete next[t]
          return next
        })
      }
    })
  }, [tickers, apiKey, baseUrl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(sourcesRef.current).forEach((es) => es.close())
      sourcesRef.current = {}
    }
  }, [])

  return (
    <div>
      {tickers.map((ticker) => {
        const entry = data[ticker]
        const status = entry?.status || 'connecting'
        return (
          <div key={ticker} className="ticker-card" style={{ marginBottom: 16 }}>
            <div className="ticker-header">
              <span className="ticker-symbol">{ticker}</span>
              <span className={`connection-status ${status}`}>{status}</span>
            </div>
            {entry?.current ? (
              <>
                <div className="ticker-price">{entry.current.price.toFixed(2)} {entry.current.currency}</div>
                <div className="ticker-meta">
                  {new Date(entry.current.ts).toLocaleString()} &middot; Vol: {entry.current.volume}
                </div>
              </>
            ) : (
              <div className="ticker-meta">Waiting for data…</div>
            )}
            {entry?.history.length > 1 && (
              <div className="chart-container">
                <Line
                  data={{
                    labels: entry.history.map((h) =>
                      new Date(h.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    ),
                    datasets: [
                      {
                        label: ticker,
                        data: entry.history.map((h) => h.price),
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { display: true, ticks: { color: '#64748b', maxTicksLimit: 6, font: { size: 10 } }, grid: { color: '#1a2332' } },
                      y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1a2332' } },
                    },
                  }}
                />
              </div>
            )}
            {entry?.history.length > 1 && (
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '0.82rem' }}>
                  Show last {entry.history.length} ticks
                </summary>
                <table className="history-table">
                  <thead>
                    <tr><th>Time</th><th>Price</th><th>Vol</th></tr>
                  </thead>
                  <tbody>
                    {entry.history
                      .slice()
                      .reverse()
                      .map((h, i) => (
                        <tr key={i}>
                          <td>{new Date(h.ts).toLocaleTimeString()}</td>
                          <td>{h.price.toFixed(2)}</td>
                          <td>{h.volume}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </details>
            )}
          </div>
        )
      })}
    </div>
  )
}
