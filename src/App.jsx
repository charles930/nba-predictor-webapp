import React, { useState, useEffect } from 'react'
import { APIManager } from './lib/api'
import { NBAPredictor } from './lib/predictor'
import './App.css'
import Header from './components/Header'
import DateNavigation from './components/DateNavigation'
import GamesList from './components/GamesList'
import GameDetail from './components/GameDetail'
import SettingsPanel from './components/SettingsPanel'

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState('list') // 'list' or 'detail'
  const [gamesData, setGamesData] = useState([])
  const [currentGame, setCurrentGame] = useState(null)
  const [currentPrediction, setCurrentPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [lastUpdate, setLastUpdate] = useState('Never')

  // Initialize API and predictor
  const apiManager = new APIManager()
  const predictor = new NBAPredictor()

  useEffect(() => {
    loadGames()
  }, [currentDate])

  const loadGames = async () => {
    setLoading(true)
    setError(null)
    try {
      const dateStr = apiManager.formatDate(currentDate)
      const gamesResult = await apiManager.getGames(dateStr)
      setGamesData(gamesResult.data || [])
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (err) {
      setError('Failed to load games. Please try again.')
      console.error('Error loading games:', err)
    } finally {
      setLoading(false)
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

  const handleDateChange = (days) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate)
  }

  const handleRefresh = () => {
    loadGames()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header 
        onSettingsClick={() => setShowSettings(true)}
        lastUpdate={lastUpdate}
      />
      
      <DateNavigation 
        currentDate={currentDate}
        onPrevDay={() => handleDateChange(-1)}
        onNextDay={() => handleDateChange(1)}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
            <button 
              onClick={loadGames}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
            >
              Retry
            </button>
          </div>
        )}

        {currentView === 'list' && (
          <GamesList 
            games={gamesData}
            loading={loading}
            onSelectGame={handleSelectGame}
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
            loadGames()
          }}
        />
      )}
    </div>
  )
}
