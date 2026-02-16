import React, { useState } from 'react'

export default function SettingsPanel({ apiManager, onClose, onSave }) {
  const [ballDontLieKey, setBallDontLieKey] = useState(apiManager.ballDontLieKey || '')
  const [oddsApiKey, setOddsApiKey] = useState(apiManager.oddsApiKey || '')
  const [status, setStatus] = useState('')
  const [testing, setTesting] = useState(false)

  const handleSave = async () => {
    await apiManager.saveAPIKeys(ballDontLieKey, oddsApiKey)
    setStatus('✓ Settings saved successfully')
    setTimeout(() => {
      onSave()
    }, 1500)
  }

  const handleTestAPIs = async () => {
    setTesting(true)
    setStatus('Testing API connections...')
    
    let results = []
    
    // Test BallDontLie
    if (ballDontLieKey.trim()) {
      try {
        const response = await fetch('https://api.balldontlie.io/v1/teams', {
          headers: {
            'Authorization': ballDontLieKey,
            'Accept': 'application/json'
          }
        })
        if (response.ok) {
          results.push('✓ BallDontLie API: Connected')
        } else {
          results.push(`✗ BallDontLie API: Error ${response.status}`)
        }
      } catch (err) {
        results.push(`✗ BallDontLie API: ${err.message}`)
      }
    } else {
      results.push('⚠ BallDontLie API: No key provided')
    }
    
    // Test The Odds API
    if (oddsApiKey.trim()) {
      try {
        const response = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${oddsApiKey}`)
        if (response.ok) {
          results.push('✓ The Odds API: Connected')
        } else {
          results.push(`✗ The Odds API: Error ${response.status}`)
        }
      } catch (err) {
        results.push(`✗ The Odds API: ${err.message}`)
      }
    } else {
      results.push('⚠ The Odds API: No key provided')
    }
    
    setStatus(results.join(' | '))
    setTesting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">API Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* BallDontLie Key */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              BallDontLie API Key
            </label>
            <input
              type="text"
              value={ballDontLieKey}
              onChange={(e) => setBallDontLieKey(e.target.value)}
              placeholder="Optional - Enter API key"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Get free key at <a href="https://www.balldontlie.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">balldontlie.io</a>
            </p>
          </div>

          {/* Odds API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              The Odds API Key
            </label>
            <input
              type="text"
              value={oddsApiKey}
              onChange={(e) => setOddsApiKey(e.target.value)}
              placeholder="Optional - Enter API key"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Get free key at <a href="https://the-odds-api.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">the-odds-api.com</a>
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 mb-6">
          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
          >
            Save Settings
          </button>
          <button
            onClick={handleTestAPIs}
            disabled={testing}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded transition disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Connections'}
          </button>
        </div>

        {/* Status */}
        {status && (
          <div className="text-xs text-slate-300 bg-slate-800 rounded p-3">
            {status}
          </div>
        )}
      </div>
    </div>
  )
}
