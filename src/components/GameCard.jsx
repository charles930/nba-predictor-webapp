import { APIManager } from '../lib/api'
import { formatGameTimeET } from '../lib/dateUtils'

export default function GameCard({ game, onSelect }) {
  const apiManager = new APIManager()
  const homeColors = apiManager.getTeamColors(game.home_team.abbreviation)
  const awayColors = apiManager.getTeamColors(game.visitor_team.abbreviation)

  return (
    <button
      onClick={() => onSelect(game)}
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition cursor-pointer"
    >
      {/* Time */}
      <div className="text-sm text-slate-400 mb-4">
        {game.time || formatGameTimeET(game.datetime)}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        {/* Away Team */}
        <div className="flex-1">
          <div 
            className="inline-block px-2 py-1 rounded text-xs font-bold mb-1"
            style={{ backgroundColor: awayColors.primary, color: '#fff' }}
          >
            {game.visitor_team.abbreviation}
          </div>
          <p className="font-bold text-white">{game.visitor_team.name}</p>
        </div>

        {/* VS */}
        <div className="flex-shrink-0 mx-4">
          <p className="text-slate-500 font-bold">VS</p>
        </div>

        {/* Home Team */}
        <div className="flex-1 text-right">
          <div 
            className="inline-block px-2 py-1 rounded text-xs font-bold mb-1"
            style={{ backgroundColor: homeColors.primary, color: '#fff' }}
          >
            {game.home_team.abbreviation}
          </div>
          <p className="font-bold text-white">{game.home_team.name}</p>
        </div>
      </div>

      {/* Status */}
      <div className="text-xs text-slate-400 text-center">
        Tap to view prediction
      </div>
    </button>
  )
}
