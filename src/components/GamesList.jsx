import GameCard from './GameCard'

export default function GamesList({ games, loading, onSelectGame }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin text-4xl mb-4">🏀</div>
        <p className="text-slate-400">Loading games...</p>
      </div>
    )
  }

  if (!games || games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <span className="text-5xl mb-4">📅</span>
        <p className="text-slate-400">No games scheduled for this date</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {games.map(game => (
        <GameCard 
          key={game.id}
          game={game}
          onSelect={onSelectGame}
        />
      ))}
    </div>
  )
}
