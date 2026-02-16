import React, { useState } from 'react'
import PredictionCard from './PredictionCard'
import TeamComparison from './TeamComparison'
import FactorsBreakdown from './FactorsBreakdown'

export default function GameDetail({ game, prediction, apiManager, onBack }) {
  const [expandedFactors, setExpandedFactors] = useState(false)
  const homeColors = apiManager.getTeamColors(game.home_team.abbreviation)
  const awayColors = apiManager.getTeamColors(game.visitor_team.abbreviation)

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 text-slate-400 hover:text-white transition"
      >
        ← Back to Games
      </button>

      {/* Game Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between gap-4">
          {/* Away Team */}
          <div className="flex-1">
            <div 
              className="inline-block px-3 py-1 rounded text-sm font-bold mb-3"
              style={{ backgroundColor: awayColors.primary, color: '#fff' }}
            >
              {game.visitor_team.abbreviation}
            </div>
            <h2 className="text-3xl font-bold text-white">{game.visitor_team.name}</h2>
            <p className="text-slate-400">Away</p>
          </div>

          {/* Score / Time */}
          <div className="text-center px-4">
            <p className="text-slate-400 text-sm mb-2">{game.time || '7:30 PM ET'}</p>
            <div className="text-4xl font-bold text-slate-300">@</div>
          </div>

          {/* Home Team */}
          <div className="flex-1 text-right">
            <div 
              className="inline-block px-3 py-1 rounded text-sm font-bold mb-3"
              style={{ backgroundColor: homeColors.primary, color: '#fff' }}
            >
              {game.home_team.abbreviation}
            </div>
            <h2 className="text-3xl font-bold text-white">{game.home_team.name}</h2>
            <p className="text-slate-400">Home</p>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PredictionCard
          title="Point Spread"
          prediction={prediction.spread}
          game={game}
          type="spread"
          colors={[awayColors, homeColors]}
        />
        <PredictionCard
          title="Moneyline"
          prediction={prediction.moneyline}
          game={game}
          type="moneyline"
          colors={[awayColors, homeColors]}
        />
      </div>

      {/* Factors Breakdown */}
      <div className="mb-8">
        <button
          onClick={() => setExpandedFactors(!expandedFactors)}
          className="w-full bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition text-left"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Prediction Factors</h3>
            <span className={`transition ${expandedFactors ? 'rotate-180' : ''}`}>▼</span>
          </div>
        </button>
        {expandedFactors && (
          <FactorsBreakdown factors={prediction.factors} />
        )}
      </div>

      {/* Team Comparison */}
      <TeamComparison 
        homeTeam={game.home_team}
        awayTeam={game.visitor_team}
        homeColors={homeColors}
        awayColors={awayColors}
      />
    </div>
  )
}
