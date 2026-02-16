import React, { useState, useEffect } from 'react'
import { APIManager } from './lib/api'
import { NBAPredictor } from './lib/predictor'
import './App.css'
import Header from './components/Header'
import GamesList from './components/GamesList'
import GameDetail from './components/GameDetail'
import SettingsPanel from './components/SettingsPanel'

export default function App() {
  const [currentView, setCurrentView] = useState('list') // 'list' or 'detail'
  const [gamesData, setGamesData] = useState([])
  const [currentGame, setCurrentGame] = useState(null)
  const [currentPrediction, setCurrentPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [lastUpdate, setLastUpdate] = useState('Never')
  const [fallbackMessage, setFallbackMessage] = useState(null)
  const [nextStartDate, setNextStartDate] = useState(null)

  // Initialize API and predictor
  const apiManager = new APIManager()
  const predictor = new NBAPredictor()

  useEffect(() => {
    loadInitialGames()
  }, [])

  const loadInitialGames = async () => {
    setLoading(true)
    setError(null)
    setFallbackMessage(null)
    try {
      // Start with today's date
      const today = new Date()
      const startDate = apiManager.formatDate(today)
      
      const gamesResult = await apiManager.getGamesList(startDate, 10)
      setGamesData(gamesResult.data || [])
      setLastUpdate(new Date().toLocaleTimeString())
      
      // Calculate next start date for "Load More" button
      if (gamesResult.data && gamesResult.data.length > 0) {
        // Get the date of the last game and add one day
        const lastGame = gamesResult.data[gamesResult.data.length - 1]
        const lastGameDate = new Date(lastGame.date)
        lastGameDate.setDate(lastGameDate.getDate() + 1)
        setNextStartDate(apiManager.formatDate(lastGameDate))
      }
      
      // Show fallback message if games are from a different date
      if (gamesResult._message) {
        setFallbackMessage(gamesResult._message)
      }
    } catch (err) {
      setError(`Failed to load games: ${err.message}`)
      console.error('Error loading games:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreGames = async () => {
    if (!nextStartDate) return
    
    setLoadingMore(true)
    setError(null)
    try {
      const gamesResult = await apiManager.getGamesList(nextStartDate, 10)
      const newGames = gamesResult.data || []
      
      // Append new games to existing list
      setGamesData(prev => [...prev, ...newGames])
      setLastUpdate(new Date().toLocaleTimeString())
      
      // Calculate next start date
      if (newGames.length > 0) {
        const lastGame = newGames[newGames.length - 1]
        const lastGameDate = new Date(lastGame.date)
        lastGameDate.setDate(lastGameDate.getDate() + 1)
        setNextStartDate(apiManager.formatDate(lastGameDate))
      } else {
        setNextStartDate(null) // No more games
      }
    } catch (err) {
      setError('Failed to load more games. Please try again.')
      console.error('Error loading more games:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSelectGame = async (game) => {
    setCurrentGame(game)
    setLoading(true)
    try {
      const homeStats = await apiManager.getTeamStats(game.home_team.id)
      const awayStats = await apiManager.getTeamStats(game.visitor_team.id)
      const odds = await apiManager.getOdds(game.home_team.name, game.visitor_team.name)
      
      const prediction = await predictor.generatePrediction(game, homeStats, awayStats, odds)
      setCurrentPrediction(prediction)
      setCurrentView('detail')
    } catch (err) {
      setError('Failed to generate prediction. Please try again.')
      console.error('Error generating prediction:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setCurrentGame(null)
    setCurrentPrediction(null)
  }

  const handleRefresh = () => {
    loadInitialGames()
    setGamesData([])
    setNextStartDate(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header 
        onSettingsClick={() => setShowSettings(true)}
        lastUpdate={lastUpdate}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
            <button 
              onClick={loadInitialGames}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
            >
              Retry
            </button>
          </div>
        )}

        {fallbackMessage && (
          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-blue-200">ℹ️ {fallbackMessage}</p>
          </div>
        )}

        {currentView === 'list' && (
          <GamesList 
            games={gamesData}
            loading={loading}
            loadingMore={loadingMore}
            onSelectGame={handleSelectGame}
            onLoadMore={loadMoreGames}
            canLoadMore={nextStartDate !== null}
          />
        )}

        {currentView === 'detail' && currentGame && currentPrediction && (
          <GameDetail 
            game={currentGame}
            prediction={currentPrediction}
            apiManager={apiManager}
            onBack={handleBackToList}
          />
        )}
      </main>

      {showSettings && (
        <SettingsPanel 
          apiManager={apiManager}
          onClose={() => setShowSettings(false)}
          onSave={() => {
            setShowSettings(false)
            loadInitialGames()
          }}
        />
      )}
    </div>
  )
}
