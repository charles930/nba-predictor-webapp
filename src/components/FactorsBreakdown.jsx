function FactorBar({ name, value, max = 100 }) {
  const percentage = ((value + max) / (max * 2)) * 100
  const isPositive = value >= 0
  
  const getColor = () => {
    if (Math.abs(value) < 20) return 'bg-slate-600'
    if (Math.abs(value) < 50) return isPositive ? 'bg-blue-600' : 'bg-orange-600'
    return isPositive ? 'bg-green-600' : 'bg-red-600'
  }

  const labels = {
    elo: 'Elo Rating',
    recentForm: 'Recent Form',
    offenseRating: 'Offense',
    defenseRating: 'Defense',
    homeAdvantage: 'Home Advantage',
    restDays: 'Rest'
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-300">{labels[name] || name}</span>
        <span className="text-xs text-slate-400">{value > 0 ? '+' : ''}{value.toFixed(1)}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  )
}

export default function FactorsBreakdown({ factors }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-b-lg p-6">
      <div className="space-y-4">
        {Object.entries(factors).map(([name, value]) => (
          <FactorBar key={name} name={name} value={value} />
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-700">
        <p className="text-xs text-slate-400">
          These factors are weighted and combined to create the prediction. Positive values favor the home team, negative values favor the away team.
        </p>
      </div>
    </div>
  )
}
