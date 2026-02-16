// Netlify serverless function for NBA games
// This replaces the Express backend for production

import fetch from 'node-fetch';

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[CACHE HIT] ${key}`);
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  };
}

async function fetchGamesForDate(date, apiKey) {
  const url = `https://api.balldontlie.io/v1/games?dates[]=${date}`;
  console.log(`[REAL DATA] Fetching games from BallDontLie API for ${date}...`);

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[API ERROR] BallDontLie returned ${response.status}: ${errorText}`
    );
    throw new Error(`BallDontLie API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

async function fetchGamesDateRange(startDate, endDate, apiKey) {
  // Fetch games from startDate to endDate (7 day range for efficiency)
  const url = `https://api.balldontlie.io/v1/games?start_date=${startDate}&end_date=${endDate}&per_page=100`;
  console.log(`[REAL DATA] Fetching games from ${startDate} to ${endDate}...`);

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[API ERROR] BallDontLie returned ${response.status}: ${errorText}`
    );
    throw new Error(`BallDontLie API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

function getMockGamesList(startDate, per_page = 10) {
  // Generate mock games across multiple days
  const mockGames = [
    { id: 1, abbreviations: ['LAL', 'GSW'], names: ['Lakers', 'Warriors'], times: ['19:30'] },
    { id: 2, abbreviations: ['BOS', 'MIA'], names: ['Celtics', 'Heat'], times: ['19:00'] },
    { id: 3, abbreviations: ['PHX', 'DEN'], names: ['Suns', 'Nuggets'], times: ['22:00'] },
    { id: 4, abbreviations: ['LAC', 'NYK'], names: ['Clippers', 'Knicks'], times: ['19:30'] },
    { id: 5, abbreviations: ['MIL', 'BOS'], names: ['Bucks', 'Celtics'], times: ['20:00'] },
    { id: 6, abbreviations: ['DAL', 'HOU'], names: ['Mavericks', 'Rockets'], times: ['20:30'] },
    { id: 7, abbreviations: ['SAS', 'OKC'], names: ['Spurs', 'Thunder'], times: ['21:00'] },
    { id: 8, abbreviations: ['TOR', 'WAS'], names: ['Raptors', 'Wizards'], times: ['19:30'] },
    { id: 9, abbreviations: ['ATL', 'CHA'], names: ['Hawks', 'Hornets'], times: ['19:30'] },
    { id: 10, abbreviations: ['MIN', 'MEM'], names: ['Timberwolves', 'Grizzlies'], times: ['20:00'] }
  ];

  const games = [];
  const startDateObj = parseDate(startDate);
  
  for (let i = 0; i < per_page; i++) {
    const dayOffset = Math.floor(i / 3);
    const gameDate = new Date(startDateObj);
    gameDate.setDate(gameDate.getDate() + dayOffset);
    const gameDateStr = formatDate(gameDate);
    
    const mockGame = mockGames[i % mockGames.length];
    
    games.push({
      id: i,
      date: gameDateStr,
      home_team: {
        id: i * 2,
        abbreviation: mockGame.abbreviations[0],
        city: mockGame.names[0].split(' ')[0],
        name: mockGame.names[0],
        full_name: `${mockGame.names[0]}`
      },
      visitor_team: {
        id: i * 2 + 1,
        abbreviation: mockGame.abbreviations[1],
        city: mockGame.names[1].split(' ')[0],
        name: mockGame.names[1],
        full_name: `${mockGame.names[1]}`
      },
      home_team_score: 0,
      visitor_team_score: 0,
      status: 'scheduled',
      time: mockGame.times[0] + ' ET',
      period: 0
    });
  }
  
  return { data: games };
}

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { date, start_date, per_page = '10', cursor = '0' } = event.queryStringParameters || {};
    
    // Support legacy date parameter for backward compatibility
    const startDate = start_date || date;

    if (!startDate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'start_date or date parameter required' })
      };
    }

    const limit = Math.min(parseInt(per_page), 50); // Max 50 per request
    const cacheKey = `games:${startDate}:${limit}`;
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cached)
      };
    }

    // Get API key from environment
    const apiKey = process.env.BALLDONTLIE_API_KEY;
    
    // DEBUG: Log API key status (masked)
    const hasApiKey = !!apiKey;
    const maskedKey = apiKey ? apiKey.substring(0, 4) + '***' + apiKey.substring(apiKey.length - 4) : 'NOT SET';
    console.log(`[DEBUG] API Key Status: ${hasApiKey ? 'PRESENT' : 'MISSING'} (masked: ${maskedKey})`);

    if (!apiKey) {
      console.warn(
        `[MOCK DATA] No BALLDONTLIE_API_KEY found. Using mock games from ${startDate}`
      );
      const mockData = getMockGamesList(startDate, limit);
      const result = {
        ...mockData,
        _dataSource: 'MOCK',
        _message:
          'Using mock data. Configure BALLDONTLIE_API_KEY in Netlify env vars to enable real data.',
        _debug: {
          apiKeyFound: false,
          apiKeyEnvVar: 'BALLDONTLIE_API_KEY',
          url: `https://api.balldontlie.io/v1/games?start_date=${startDate}&end_date=${endDate}&per_page=100`,
          error: 'API_KEY_NOT_CONFIGURED'
        }
      };
      setCache(cacheKey, result);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    // Fetch games in date range (7 days from start date)
    const startDateObj = parseDate(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + 7);
    const endDate = formatDate(endDateObj);

    let data = await fetchGamesDateRange(startDate, endDate, apiKey);
    
    // Sort games by date
    if (data.data && Array.isArray(data.data)) {
      data.data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
    }

    // Limit results
    const games = (data.data || []).slice(0, limit);
    data.data = games;

    console.log(
      `[REAL DATA] Successfully fetched ${data.data?.length || 0} games from BallDontLie`
    );

    // Add data source metadata
    const enrichedData = {
      ...data,
      data: games,
      _dataSource: 'REAL',
      _apiProvider: 'BallDontLie',
      _startDate: startDate,
      _endDate: endDate,
      _count: games.length,
      _debug: {
        apiKeyFound: true,
        apiKeyEnvVar: 'BALLDONTLIE_API_KEY',
        url: `https://api.balldontlie.io/v1/games?start_date=${startDate}&end_date=${endDate}&per_page=100`,
        gamesReturned: games.length,
        timestamp: new Date().toISOString()
      }
    };

    setCache(cacheKey, enrichedData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(enrichedData)
    };
  } catch (error) {
    console.error(`[ERROR] Failed to fetch games: ${error.message}`);
    // Fallback to mock data on error
    console.warn(`[FALLBACK] Returning mock data due to error`);
    const startDate = event.queryStringParameters?.start_date || event.queryStringParameters?.date || '2026-02-16';
    const per_page = event.queryStringParameters?.per_page || '10';
    const mockData = getMockGamesList(startDate, parseInt(per_page));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...mockData,
        _dataSource: 'MOCK',
        _message: 'Real API failed, using mock data as fallback',
        _debug: {
          apiKeyFound: !!process.env.BALLDONTLIE_API_KEY,
          apiKeyEnvVar: 'BALLDONTLIE_API_KEY',
          error: error.message,
          errorType: error.constructor.name,
          timestamp: new Date().toISOString()
        }
      })
    };
  }
};
