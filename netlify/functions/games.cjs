// Netlify serverless function for NBA games
// This replaces the Express backend for production

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

exports.handler = async (event, context) => {
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
    const { date } = event.queryStringParameters || {};

    if (!date) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Date parameter required' })
      };
    }

    // Check cache first
    const cacheKey = `games:${date}`;
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
        `[MOCK DATA] No BALLDONTLIE_API_KEY found. Using mock games for ${date}`
      );
      const mockData = getMockGames(date);
      const result = {
        ...mockData,
        _dataSource: 'MOCK',
        _message:
          'Using mock data. Configure BALLDONTLIE_API_KEY in Netlify env vars to enable real data.'
      };
      setCache(cacheKey, result);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    // Try to fetch games for the requested date
    let data = await fetchGamesForDate(date, apiKey);
    let gameCount = data.data?.length || 0;
    let fallbackDate = null;

    // If no games for this date, try previous dates (up to 7 days back)
    if (gameCount === 0) {
      console.log(
        `[FALLBACK] No games found for ${date}. Trying previous dates...`
      );
      const requestedDate = parseDate(date);

      for (let daysBack = 1; daysBack <= 7; daysBack++) {
        const checkDate = new Date(requestedDate);
        checkDate.setDate(checkDate.getDate() - daysBack);
        const checkDateStr = formatDate(checkDate);

        try {
          const checkData = await fetchGamesForDate(checkDateStr, apiKey);
          const checkGameCount = checkData.data?.length || 0;

          if (checkGameCount > 0) {
            console.log(
              `[FALLBACK SUCCESS] Found ${checkGameCount} games on ${checkDateStr}`
            );
            data = checkData;
            fallbackDate = checkDateStr;
            break;
          }
        } catch (err) {
          console.log(`[FALLBACK ATTEMPT] Failed to fetch ${checkDateStr}: ${err.message}`);
          continue;
        }
      }

      if (gameCount === 0 && !fallbackDate) {
        console.warn(
          `[NO GAMES] No games found for ${date} or previous 7 days`
        );
      }
    }

    console.log(
      `[REAL DATA] Successfully fetched ${data.data?.length || 0} games from BallDontLie`
    );

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
    const mockData = getMockGames(
      event.queryStringParameters?.date || '2026-02-16'
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
