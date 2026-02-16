import fetch from "node-fetch";
// Netlify serverless function for betting odds

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

function getMockOdds(homeTeam, awayTeam) {
  const spread = Math.floor(Math.random() * 10) - 5;
  const homeML = spread < 0 ? -150 - Math.abs(spread) * 20 : 130 + spread * 20;
  const awayML = spread > 0 ? -150 - spread * 20 : 130 + Math.abs(spread) * 20;

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
  };
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
    const { homeTeam, awayTeam } = event.queryStringParameters || {};

    if (!homeTeam || !awayTeam) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'homeTeam and awayTeam parameters required'
        })
      };
    }

    // Check cache first
    const cacheKey = `odds:${homeTeam}:${awayTeam}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cached)
      };
    }

    // Get API key from environment
    const apiKey = process.env.ODDS_API_KEY;
    
    // DEBUG: Log API key status (masked)
    const hasApiKey = !!apiKey;
    const maskedKey = apiKey ? apiKey.substring(0, 4) + '***' + apiKey.substring(apiKey.length - 4) : 'NOT SET';
    console.log(`[DEBUG] API Key Status: ${hasApiKey ? 'PRESENT' : 'MISSING'} (masked: ${maskedKey})`);

    if (!apiKey) {
      console.warn(
        `[MOCK DATA] No ODDS_API_KEY found. Using mock odds for ${homeTeam} vs ${awayTeam}`
      );
      const mockData = getMockOdds(homeTeam, awayTeam);
      const result = {
        ...mockData,
        _dataSource: 'MOCK',
        _message:
          'Using mock data. Configure ODDS_API_KEY in Netlify env vars to enable real odds data.',
        _debug: {
          apiKeyFound: false,
          apiKeyEnvVar: 'ODDS_API_KEY',
          homeTeam: homeTeam,
          awayTeam: awayTeam,
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

    // Fetch from The Odds API
    const url = `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${apiKey}&regions=us&markets=spreads,h2h`;
    console.log(
      `[REAL DATA] Fetching odds from The Odds API for ${homeTeam} vs ${awayTeam}...`
    );

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API ERROR] The Odds API returned ${response.status}: ${errorText}`
      );
      throw new Error(`The Odds API error: ${response.status}`);
    }

    const data = await response.json();

    // Find the specific game
    const gameOdds = data.find((game) =>
      (game.home_team.includes(homeTeam) ||
        homeTeam.includes(game.home_team)) &&
      (game.away_team.includes(awayTeam) || awayTeam.includes(game.away_team))
    );

    if (gameOdds) {
      console.log(`[REAL DATA] Found real odds from The Odds API`);
      const enrichedData = {
        ...gameOdds,
        _dataSource: 'REAL',
        _apiProvider: 'TheOddsAPI',
        _debug: {
          apiKeyFound: true,
          apiKeyEnvVar: 'ODDS_API_KEY',
          homeTeam: homeTeam,
          awayTeam: awayTeam,
          gameFound: true,
          timestamp: new Date().toISOString()
        }
      };
      setCache(cacheKey, enrichedData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(enrichedData)
      };
    } else {
      console.warn(
        `[FALLBACK] Game not found in The Odds API, using mock odds`
      );
      const mockData = getMockOdds(homeTeam, awayTeam);
      const result = {
        ...mockData,
        _dataSource: 'MOCK',
        _message: 'Game not found in real odds API, using mock data',
        _debug: {
          apiKeyFound: true,
          apiKeyEnvVar: 'ODDS_API_KEY',
          homeTeam: homeTeam,
          awayTeam: awayTeam,
          gameFound: false,
          timestamp: new Date().toISOString()
        }
      };
      setCache(cacheKey, result);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }
  } catch (error) {
    console.error(`[ERROR] Failed to fetch odds: ${error.message}`);
    console.warn(`[FALLBACK] Returning mock odds due to error`);
    const mockData = getMockOdds(
      event.queryStringParameters?.homeTeam || 'LAL',
      event.queryStringParameters?.awayTeam || 'GSW'
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...mockData,
        _dataSource: 'MOCK',
        _message: 'Real API failed, using mock data as fallback',
        _debug: {
          apiKeyFound: !!process.env.ODDS_API_KEY,
          apiKeyEnvVar: 'ODDS_API_KEY',
          homeTeam: event.queryStringParameters?.homeTeam || 'LAL',
          awayTeam: event.queryStringParameters?.awayTeam || 'GSW',
          error: error.message,
          errorType: error.constructor.name,
          timestamp: new Date().toISOString()
        }
      })
    };
  }
};
