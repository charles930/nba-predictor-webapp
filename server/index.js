import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Cache for API responses
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to get from cache
function getFromCache(key) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  cache.delete(key)
  return null
}

// Helper function to set cache
function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

// Health check endpoint
app.get('/health', (req, res) => {
  const apiKeyStatus = {
    balldontlie: process.env.BALLDONTLIE_API_KEY ? 'configured ✅' : 'NOT SET - using mock data',
    oddsApi: process.env.ODDS_API_KEY ? 'configured ✅' : 'NOT SET - using mock data'
  }
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dataSource: 'REAL API keys configured' in apiKeyStatus ? 'REAL' : 'MOCK',
    apiStatus: apiKeyStatus,
    note: 'Configure BALLDONTLIE_API_KEY and ODDS_API_KEY in .env to use real data'
  })
})

// Helper functions for date handling
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function fetchGamesForDate(date, apiKey) {
  const url = `https://api.balldontlie.io/v1/games?dates[]=${date}`
  console.log(`[REAL DATA] Fetching games from BallDontLie API for ${date}...`)

  const response = await fetch(url, {
    headers: {
      'Authorization': apiKey,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[API ERROR] BallDontLie returned ${response.status}: ${errorText}`)
    throw new Error(`BallDontLie API error: ${response.status}`)
  }

  const data = await response.json()
  return data
}

// Get games for a specific date
app.get('/api/games', async (req, res) => {
  try {
    const { date } = req.query
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' })
    }

    const cacheKey = `games:${date}`
    const cached = getFromCache(cacheKey)
    if (cached) {
      console.log(`[CACHE HIT] Games for ${date}`)
      return res.json(cached)
    }

    // Get API key from environment
    const apiKey = process.env.BALLDONTLIE_API_KEY
    
    if (!apiKey) {
      // Return mock data if no API key
      console.warn(`[MOCK DATA] No BALLDONTLIE_API_KEY found. Using mock games for ${date}`)
      console.warn(`[ACTION REQUIRED] Set BALLDONTLIE_API_KEY in .env to use real data. Sign up free at https://app.balldontlie.io`)
      const mockData = getMockGames(date)
      return res.json({
        ...mockData,
        _dataSource: 'MOCK',
        _message: 'Using mock data. Configure BALLDONTLIE_API_KEY in .env to enable real data.'
      })
    }

    // Try to fetch games for the requested date
    let data = await fetchGamesForDate(date, apiKey)
    let gameCount = data.data?.length || 0
    let fallbackDate = null

    // If no games for this date, try previous dates (up to 7 days back)
    if (gameCount === 0) {
      console.log(`[FALLBACK] No games found for ${date}. Trying previous dates...`)
      const requestedDate = parseDate(date)

      for (let daysBack = 1; daysBack <= 7; daysBack++) {
        const checkDate = new Date(requestedDate)
        checkDate.setDate(checkDate.getDate() - daysBack)
        const checkDateStr = formatDate(checkDate)

        try {
          const checkData = await fetchGamesForDate(checkDateStr, apiKey)
          const checkGameCount = checkData.data?.length || 0

          if (checkGameCount > 0) {
            console.log(`[FALLBACK SUCCESS] Found ${checkGameCount} games on ${checkDateStr}`)
            data = checkData
            fallbackDate = checkDateStr
            break
          }
        } catch (err) {
          console.log(`[FALLBACK ATTEMPT] Failed to fetch ${checkDateStr}: ${err.message}`)
          continue
        }
      }

      if (gameCount === 0 && !fallbackDate) {
        console.warn(`[NO GAMES] No games found for ${date} or previous 7 days`)
      }
    }

    console.log(`[REAL DATA] Successfully fetched ${data.data?.length || 0} games from BallDontLie`)
    
    // Add data source metadata
    const enrichedData = {
      ...data,
      _dataSource: 'REAL',
      _apiProvider: 'BallDontLie',
      _requestedDate: date,
      _fallbackDate: fallbackDate,
      _message: fallbackDate
        ? `Showing games from ${fallbackDate} (no games found for ${date})`
        : undefined
    }
    
    setCache(cacheKey, enrichedData)
    res.json(enrichedData)
  } catch (error) {
    console.error(`[ERROR] Failed to fetch real games: ${error.message}`)
    // Only fallback to mock data on error
    console.warn(`[FALLBACK] Returning mock data due to error`)
    const mockData = getMockGames(req.query.date)
    res.json({
      ...mockData,
      _dataSource: 'MOCK',
      _message: 'Real API failed, using mock data as fallback'
    })
  }
})

// Get team stats for a season
app.get('/api/team-stats', async (req, res) => {
  try {
    const { teamId, season } = req.query
    
    if (!teamId) {
      return res.status(400).json({ error: 'teamId parameter required' })
    }

    const cacheKey = `team-stats:${teamId}:${season || 'current'}`
    const cached = getFromCache(cacheKey)
    if (cached) {
      console.log(`[CACHE HIT] Team stats for team ${teamId}`)
      return res.json(cached)
    }

    // Get API key from environment
    const apiKey = process.env.BALLDONTLIE_API_KEY
    
    if (!apiKey) {
      console.warn(`[MOCK DATA] No BALLDONTLIE_API_KEY found. Using mock team stats for team ${teamId}`)
      return res.json(getMockTeamStats(teamId))
    }

    // Fetch from BallDontLie API
    const url = `https://api.balldontlie.io/v1/team_stats?team_ids[]=${teamId}&seasons[]=${season || 2024}`
    console.log(`[REAL DATA] Fetching team stats from BallDontLie API...`)
    
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`[API ERROR] BallDontLie API returned ${response.status}`)
      throw new Error(`BallDontLie API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[REAL DATA] Successfully fetched team stats from BallDontLie`)
    
    const enrichedData = {
      ...data,
      _dataSource: 'REAL',
      _apiProvider: 'BallDontLie'
    }
    
    setCache(cacheKey, enrichedData)
    res.json(enrichedData)
  } catch (error) {
    console.error(`[ERROR] Failed to fetch real team stats: ${error.message}`)
    console.warn(`[FALLBACK] Returning mock team stats`)
    res.json({
      ...getMockTeamStats(req.query.teamId),
      _dataSource: 'MOCK',
      _message: 'Real API failed, using mock data as fallback'
    })
  }
})

// Get odds for a game
app.get('/api/odds', async (req, res) => {
  try {
    const { homeTeam, awayTeam } = req.query
    
    if (!homeTeam || !awayTeam) {
      return res.status(400).json({ error: 'homeTeam and awayTeam parameters required' })
    }

    const cacheKey = `odds:${homeTeam}:${awayTeam}`
    const cached = getFromCache(cacheKey)
    if (cached) {
      console.log(`[CACHE HIT] Odds for ${homeTeam} vs ${awayTeam}`)
      return res.json(cached)
    }

    // Get API key from environment
    const apiKey = process.env.ODDS_API_KEY
    
    if (!apiKey) {
      // Return mock odds if no API key
      console.warn(`[MOCK DATA] No ODDS_API_KEY found. Using mock odds for ${homeTeam} vs ${awayTeam}`)
      const mockData = getMockOdds(homeTeam, awayTeam)
      return res.json({
        ...mockData,
        _dataSource: 'MOCK',
        _message: 'Using mock data. Configure ODDS_API_KEY in .env to enable real odds data.'
      })
    }

    // Fetch from The Odds API
    const url = `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${apiKey}&regions=us&markets=spreads,h2h`
    console.log(`[REAL DATA] Fetching odds from The Odds API for ${homeTeam} vs ${awayTeam}...`)
    
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API ERROR] The Odds API returned ${response.status}: ${errorText}`)
      throw new Error(`The Odds API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Find the specific game
    const gameOdds = data.find(game => 
      (game.home_team.includes(homeTeam) || homeTeam.includes(game.home_team)) &&
      (game.away_team.includes(awayTeam) || awayTeam.includes(game.away_team))
    )

    if (gameOdds) {
      console.log(`[REAL DATA] Found real odds from The Odds API`)
      const enrichedData = {
        ...gameOdds,
        _dataSource: 'REAL',
        _apiProvider: 'TheOddsAPI'
      }
      setCache(cacheKey, enrichedData)
      res.json(enrichedData)
    } else {
      console.warn(`[FALLBACK] Game not found in The Odds API, using mock odds`)
      const mockData = getMockOdds(homeTeam, awayTeam)
      res.json({
        ...mockData,
        _dataSource: 'MOCK',
        _message: 'Game not found in real odds API, using mock data'
      })
    }
  } catch (error) {
    console.error(`[ERROR] Failed to fetch real odds: ${error.message}`)
    // Only fallback to mock data on error
    console.warn(`[FALLBACK] Returning mock odds due to error`)
    const mockData = getMockOdds(req.query.homeTeam, req.query.awayTeam)
    res.json({
      ...mockData,
      _dataSource: 'MOCK',
      _message: 'Real API failed, using mock data as fallback'
    })
  }
})

// Mock data functions
function getMockGames(date) {
  return {
    data: [
      {
        id: 1,
        date: date,
        home_team: {
          id: 1,
          abbreviation: 'LAL',
          city: 'Los Angeles',
          name: 'Lakers',
          full_name: 'Los Angeles Lakers'
        },
        visitor_team: {
          id: 2,
          abbreviation: 'GSW',
          city: 'Golden State',
          name: 'Warriors',
          full_name: 'Golden State Warriors'
        },
        home_team_score: 0,
        visitor_team_score: 0,
        status: 'scheduled',
        time: '7:30 PM ET'
      },
      {
        id: 2,
        date: date,
        home_team: {
          id: 3,
          abbreviation: 'BOS',
          city: 'Boston',
          name: 'Celtics',
          full_name: 'Boston Celtics'
        },
        visitor_team: {
          id: 4,
          abbreviation: 'MIA',
          city: 'Miami',
          name: 'Heat',
          full_name: 'Miami Heat'
        },
        home_team_score: 0,
        visitor_team_score: 0,
        status: 'scheduled',
        time: '7:00 PM ET'
      }
    ]
  }
}

function getMockOdds(homeTeam, awayTeam) {
  const spread = Math.floor(Math.random() * 10) - 5
  const homeML = spread < 0 ? -150 - (Math.abs(spread) * 20) : 130 + (spread * 20)
  const awayML = spread > 0 ? -150 - (spread * 20) : 130 + (Math.abs(spread) * 20)
  
  return {
    bookmakers: [
      {
        key: 'draftkings',
        title: 'DraftKings',
        markets: [
          {
            key: 'spreads',
            outcomes: [
              {
                name: homeTeam,
                price: -110,
                point: spread
              },
              {
                name: awayTeam,
                price: -110,
                point: -spread
              }
            ]
          },
          {
            key: 'h2h',
            outcomes: [
              {
                name: homeTeam,
                price: homeML
              },
              {
                name: awayTeam,
                price: awayML
              }
            ]
          }
        ]
      }
    ]
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(PORT, () => {
  console.log(`NBA Predictor backend running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
