export default function TickerSelector({ tickers, selected, onToggle }) {
  return (
    <div className="ticker-selector">
      {tickers.map((t) => (
        <button
          key={t.ticker}
          className={selected.includes(t.ticker) ? 'active' : ''}
          onClick={() => onToggle(t.ticker)}
        >
          {t.ticker}
        </button>
      ))}
    </div>
  )
}
