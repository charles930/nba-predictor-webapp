import GameCard from './GameCard'

function groupGamesByDate(games) {
  const grouped = {};
  
  games.forEach(game => {
    const gameDate = game.date;
    if (!grouped[gameDate]) {
      grouped[gameDate] = [];
    }
    grouped[gameDate].push(game);
  });
  
  // Sort dates in ascending order
  return Object.keys(grouped).sort().map(date => ({
    date,
    games: grouped[date]
  }));
}

function formatDateHeader(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
}

export default function GamesList({ games, loading, loadingMore, onSelectGame, onLoadMore, canLoadMore }) {
  if (loading && games.length === 0) {
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
        <p className="text-slate-400">No games scheduled</p>
      </div>
    )
  }

  const groupedGames = groupGamesByDate(games);

  return (
    <div className="space-y-8">
      {groupedGames.map(({ date, games: dateGames }) => (
        <div key={date}>
          <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-slate-700">
            {formatDateHeader(date)}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {dateGames.map(game => (
              <GameCard 
                key={game.id}
                game={game}
                onSelect={onSelectGame}
              />
            ))}
          </div>
        </div>
      ))}
      
      {canLoadMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className={`px-8 py-3 rounded-lg font-semibold transition ${
              loadingMore
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">🏀</span>
                Loading more...
              </span>
            ) : (
              'Load More Games'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
