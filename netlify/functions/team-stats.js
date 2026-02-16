// Netlify serverless function for team statistics

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

function getMockTeamStats(teamId) {
  const teamSeed = teamId % 30;
  const isGoodTeam = teamSeed < 10;

  const baseStats = {
    ppg: isGoodTeam ? 115 + teamSeed * 1.5 : 105 + teamSeed * 1.2,
    oppg: isGoodTeam ? 106 + teamSeed * 0.8 : 110 + teamSeed * 1.1,
    apg: 24 + (teamSeed % 6),
    rpg: 43 + (teamSeed % 8),
    spg: 7.5 + (teamSeed % 3),
    bpg: 4.5 + (teamSeed % 2.5),
    fg_pct: isGoodTeam
      ? 0.47 + ((teamSeed % 5) * 0.01)
      : 0.44 + ((teamSeed % 5) * 0.01),
    fg3_pct: isGoodTeam
      ? 0.37 + ((teamSeed % 4) * 0.01)
      : 0.34 + ((teamSeed % 4) * 0.01),
    ft_pct: 0.76 + ((teamSeed % 8) * 0.01),
    wins: isGoodTeam ? 35 + teamSeed * 2 : 20 + teamSeed,
    losses: isGoodTeam ? 20 - teamSeed / 2 : 35 - teamSeed / 2,
    win_pct: 0,
    last_10: isGoodTeam
      ? `${7 + (teamSeed % 3)}-${3 - (teamSeed % 3)}`
      : `${4 + (teamSeed % 2)}-${6 - (teamSeed % 2)}`,
    home_record: isGoodTeam
      ? `${20 + (teamSeed % 5)}-${10 - (teamSeed % 3)}`
      : `${12 + (teamSeed % 4)}-${18 - (teamSeed % 4)}`,
    away_record: isGoodTeam
      ? `${15 + (teamSeed % 3)}-${15 - (teamSeed % 3)}`
      : `${8 + (teamSeed % 3)}-${22 - (teamSeed % 3)}`,
    offensive_rating: isGoodTeam
      ? 115 + teamSeed * 0.8
      : 108 + teamSeed * 0.6,
    defensive_rating: isGoodTeam
      ? 106 + teamSeed * 0.5
      : 112 + teamSeed * 0.7,
    net_rating: 0,
    pace: 98 + (teamSeed % 6),
    true_shooting: isGoodTeam
      ? 0.58 + ((teamSeed % 5) * 0.01)
      : 0.54 + ((teamSeed % 5) * 0.01)
  };

  baseStats.losses = Math.max(10, baseStats.losses);
  baseStats.win_pct = baseStats.wins / (baseStats.wins + baseStats.losses);
  baseStats.net_rating =
    baseStats.offensive_rating - baseStats.defensive_rating;

  baseStats.ppg = Math.round(baseStats.ppg * 10) / 10;
  baseStats.oppg = Math.round(baseStats.oppg * 10) / 10;
  baseStats.offensive_rating = Math.round(baseStats.offensive_rating * 10) / 10;
  baseStats.defensive_rating = Math.round(baseStats.defensive_rating * 10) / 10;

  return { data: baseStats };
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
    const { teamId, season } = event.queryStringParameters || {};

    if (!teamId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'teamId parameter required' })
      };
    }

    // Check cache first
    const cacheKey = `team-stats:${teamId}:${season || 'current'}`;
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

    if (!apiKey) {
      console.warn(
        `[MOCK DATA] No BALLDONTLIE_API_KEY found. Using mock team stats for team ${teamId}`
      );
      const mockData = getMockTeamStats(teamId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(mockData)
      };
    }

    // Fetch from BallDontLie API
    const url = `https://api.balldontlie.io/v1/team_stats?team_ids[]=${teamId}&seasons[]=${
      season || 2025
    }`;
    console.log(`[REAL DATA] Fetching team stats from BallDontLie API...`);

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      console.error(
        `[API ERROR] BallDontLie API returned ${response.status}`
      );
      throw new Error(`BallDontLie API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[REAL DATA] Successfully fetched team stats from BallDontLie`);

    const enrichedData = {
      ...data,
      _dataSource: 'REAL',
      _apiProvider: 'BallDontLie'
    };

    setCache(cacheKey, enrichedData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(enrichedData)
    };
  } catch (error) {
    console.error(`[ERROR] Failed to fetch team stats: ${error.message}`);
    console.warn(`[FALLBACK] Returning mock team stats`);
    const mockData = getMockTeamStats(
      event.queryStringParameters?.teamId || '1'
    );
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...mockData,
        _dataSource: 'MOCK',
        _message: 'Real API failed, using mock data as fallback'
      })
    };
  }
};
