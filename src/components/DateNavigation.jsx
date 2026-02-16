export default function DateNavigation({ currentDate, onPrevDay, onNextDay, onRefresh, loading }) {
  const dateStr = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })

  return (
    <div className="bg-slate-900 border-b border-slate-700 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onPrevDay}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
            title="Previous day"
          >
            ◀
          </button>
          
          <div className="text-center min-w-40">
            <p className="text-sm text-slate-400">Games for</p>
            <p className="text-lg font-semibold text-white">{dateStr}</p>
          </div>
          
          <button
            onClick={onNextDay}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
            title="Next day"
          >
            ▶
          </button>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 rounded-lg transition ${
              loading 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'hover:bg-slate-800'
            }`}
            title="Refresh"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
          </button>
        </div>
      </div>
    </div>
  )
}
