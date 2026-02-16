function ConfidenceMeter({ confidence }) {
  const percentage = (confidence / 10) * 100
  const getColor = () => {
    if (confidence >= 8) return 'bg-green-500'
    if (confidence >= 6) return 'bg-blue-500'
    if (confidence >= 4) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">Confidence</span>
        <span className="text-sm font-bold text-white">{confidence}/10</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function PredictionCard({ title, prediction, game, type, colors }) {
  const [awayColor, homeColor] = colors
  const team = prediction.pick
  const isHome = team.id === game.home_team.id
  const teamColor = isHome ? homeColor : awayColor

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">{title}</h3>

      {/* Pick */}
      <div className="mb-6">
        <p className="text-sm text-slate-400 mb-2">Pick</p>
        <div 
          className="rounded-lg p-4 text-center"
          style={{ backgroundColor: `${teamColor.primary}20`, borderColor: teamColor.primary, borderWidth: '2px' }}
        >
          <p className="text-2xl font-bold text-white">{team.name}</p>
          {type === 'spread' && (
            <p className="text-sm text-slate-300 mt-1">
              {prediction.line > 0 ? '+' : '-'}{Math.abs(prediction.line).toFixed(1)}
            </p>
          )}
          {type === 'moneyline' && (
            <p className="text-sm text-slate-300 mt-1">{prediction.odds}</p>
          )}
        </div>
      </div>

      {/* Confidence */}
      <ConfidenceMeter confidence={prediction.confidence} />

      {/* Reasoning */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <p className="text-sm text-slate-400 mb-3">Why</p>
        <ul className="space-y-2">
          {prediction.reasoning.map((reason, idx) => (
            <li key={idx} className="text-sm text-slate-300 flex gap-2">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
