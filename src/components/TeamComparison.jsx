export default function TeamComparison({ homeTeam, awayTeam, homeColors, awayColors }) {
  // Mock team stats for display (in real app, would come from prediction data)
  const stats = [
    { label: 'Win %', home: '58.2%', away: '54.1%' },
    { label: 'PPG', home: '116.5', away: '112.3' },
    { label: 'Defensive Rating', home: '105.2', away: '108.7' },
    { label: 'Off. Efficiency', home: '114.2', away: '110.8' },
    { label: 'Last 10', home: '8-2', away: '7-3' }
  ]

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-6">Team Statistics</h3>
        
        <div className="space-y-6">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <p className="text-sm text-slate-400 mb-2">{stat.label}</p>
              <div className="flex items-center justify-between gap-4">
                {/* Away Team */}
                <div className="flex-1 text-center">
                  <p 
                    className="px-3 py-2 rounded font-semibold"
                    style={{ backgroundColor: `${awayColors.primary}30`, color: awayColors.primary }}
                  >
                    {stat.away}
                  </p>
                </div>
                
                {/* Divider */}
                <div className="text-slate-500">vs</div>
                
                {/* Home Team */}
                <div className="flex-1 text-center">
                  <p 
                    className="px-3 py-2 rounded font-semibold"
                    style={{ backgroundColor: `${homeColors.primary}30`, color: homeColors.primary }}
                  >
                    {stat.home}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
