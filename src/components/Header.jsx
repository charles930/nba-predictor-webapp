export default function Header({ onSettingsClick, lastUpdate }) {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏀</span>
            <div>
              <h1 className="text-3xl font-bold text-white">NBA Predictor</h1>
              <p className="text-sm text-slate-400">AI-Powered Betting Predictions</p>
            </div>
          </div>
          <button
            onClick={onSettingsClick}
            className="p-3 hover:bg-slate-700 rounded-lg transition"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
        <div className="mt-4 text-xs text-slate-400">
          Last update: {lastUpdate}
        </div>
      </div>
    </header>
  )
}
