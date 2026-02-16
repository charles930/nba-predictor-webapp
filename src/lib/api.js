// API Manager for NBA Betting Predictor
// Handles BallDontLie API and The Odds API integration
// Ported to web app with backend integration

export class APIManager {
    constructor(backendUrl = null) {
        this.ballDontLieBase = 'https://api.balldontlie.io/v1';
        this.oddsAPIBase = 'https://api.the-odds-api.com/v4';
        // Use Netlify functions in production, fallback to localhost for development
        this.backendUrl = backendUrl || (
            typeof window !== 'undefined' && window.location.hostname === 'localhost'
                ? 'http://localhost:3001'
                : '/.netlify/functions'
        );
        
        // Cache configuration
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Rate limiting
        this.requestQueue = [];
        this.lastRequestTime = 0;
        this.minRequestDelay = 1000; // 1 second between requests
        
        // Load API keys from localStorage
        this.loadAPIKeys();
        
        // NBA Team Colors (Official)
        this.teamColors = {
            'ATL': { primary: '#E03A3E', secondary: '#C1D32F', name: 'Hawks' },
            'BOS': { primary: '#007A33', secondary: '#BA9653', name: 'Celtics' },
            'BKN': { primary: '#000000', secondary: '#FFFFFF', name: 'Nets' },
            'CHA': { primary: '#1D1160', secondary: '#00788C', name: 'Hornets' },
            'CHI': { primary: '#CE1141', secondary: '#000000', name: 'Bulls' },
            'CLE': { primary: '#860038', secondary: '#041E42', name: 'Cavaliers' },
            'DAL': { primary: '#00538C', secondary: '#002B5E', name: 'Mavericks' },
            'DEN': { primary: '#0E2240', secondary: '#FEC524', name: 'Nuggets' },
            'DET': { primary: '#C8102E', secondary: '#1D42BA', name: 'Pistons' },
            'GSW': { primary: '#1D428A', secondary: '#FFC72C', name: 'Warriors' },
            'HOU': { primary: '#CE1141', secondary: '#000000', name: 'Rockets' },
            'IND': { primary: '#002D62', secondary: '#FDBB30', name: 'Pacers' },
            'LAC': { primary: '#C8102E', secondary: '#1D428A', name: 'Clippers' },
            'LAL': { primary: '#552583', secondary: '#FDB927', name: 'Lakers' },
            'MEM': { primary: '#5D76A9', secondary: '#12173F', name: 'Grizzlies' },
            'MIA': { primary: '#98002E', secondary: '#F9A01B', name: 'Heat' },
            'MIL': { primary: '#00471B', secondary: '#EEE1C6', name: 'Bucks' },
            'MIN': { primary: '#0C2340', secondary: '#236192', name: 'Timberwolves' },
            'NOP': { primary: '#0C2340', secondary: '#C8102E', name: 'Pelicans' },
            'NYK': { primary: '#006BB6', secondary: '#F58426', name: 'Knicks' },
            'OKC': { primary: '#007AC1', secondary: '#EF3B24', name: 'Thunder' },
            'ORL': { primary: '#0077C0', secondary: '#C4CED4', name: 'Magic' },
            'PHI': { primary: '#006BB6', secondary: '#ED174C', name: '76ers' },
            'PHX': { primary: '#1D1160', secondary: '#E56020', name: 'Suns' },
            'POR': { primary: '#E03A3E', secondary: '#000000', name: 'Trail Blazers' },
            'SAC': { primary: '#5A2D81', secondary: '#63727A', name: 'Kings' },
            'SAS': { primary: '#C4CED4', secondary: '#000000', name: 'Spurs' },
            'TOR': { primary: '#CE1141', secondary: '#000000', name: 'Raptors' },
            'UTA': { primary: '#002B5C', secondary: '#F9A01B', name: 'Jazz' },
            'WAS': { primary: '#002B5C', secondary: '#E31837', name: 'Wizards' }
        };
    }
    
    getTeamColors(abbreviation) {
        return this.teamColors[abbreviation] || { 
            primary: '#1D428A', 
            secondary: '#FDB927', 
            name: 'Unknown' 
        };
    }

    async rateLimitedFetch(url, options = {}) {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minRequestDelay) {
            const delay = this.minRequestDelay - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        this.lastRequestTime = Date.now();
        return this.fetchWithRetry(url, options, 2);
    }

    loadAPIKeys() {
        try {
            this.ballDontLieKey = localStorage.getItem('ballDontLieKey') || '';
            this.oddsApiKey = localStorage.getItem('oddsApiKey') || '';
        } catch (error) {
            console.log('Unable to load API keys from localStorage:', error);
            this.ballDontLieKey = '';
            this.oddsApiKey = '';
        }
    }

    async saveAPIKeys(ballDontLieKey, oddsApiKey) {
        this.ballDontLieKey = ballDontLieKey;
        this.oddsApiKey = oddsApiKey;
        
        try {
            localStorage.setItem('ballDontLieKey', ballDontLieKey);
            localStorage.setItem('oddsApiKey', oddsApiKey);
            return true;
        } catch (error) {
            console.error('Error saving API keys:', error);
            return false;
        }
    }

    getCacheKey(endpoint, params = {}) {
        return `${endpoint}:${JSON.stringify(params)}`;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    async fetchWithRetry(url, options = {}, retries = 3) {
        console.log('Fetching URL:', url);
        
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    mode: 'cors',
                    credentials: 'omit'
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Response error:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    // Games API Methods
    async getGames(date) {
        const cacheKey = this.getCacheKey('games', { date });
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('[CACHE HIT] Games from cache');
            return cached;
        }

        try {
            // Use Netlify function in production, Express server in development
            const path = this.backendUrl.includes('/.netlify/functions') 
                ? `/games?date=${date}` 
                : `/api/games?date=${date}`;
            const url = `${this.backendUrl}${path}`;
            const data = await this.fetchWithRetry(url);
            
            // Log data source
            if (data._dataSource === 'REAL') {
                console.log('✅ [REAL DATA] Games are from BallDontLie API');
            } else if (data._dataSource === 'MOCK') {
                console.warn('⚠️ [MOCK DATA] Using simulated games - configure BALLDONTLIE_API_KEY for real data');
            }
            
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching games from backend, using mock data:', error);
            const mockData = this.getMockGames(date);
            return {
                ...mockData,
                _dataSource: 'MOCK',
                _message: 'Backend unavailable - using mock data'
            };
        }
    }

    // Get games with pagination support (scrolling list)
    async getGamesList(startDate, perPage = 10, cursor = 0) {
        const cacheKey = this.getCacheKey('gamesList', { startDate, perPage });
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('[CACHE HIT] Games list from cache');
            return cached;
        }

        try {
            // Use Netlify function in production, Express server in development
            const path = this.backendUrl.includes('/.netlify/functions') 
                ? `/games?start_date=${startDate}&per_page=${perPage}&cursor=${cursor}` 
                : `/api/games?start_date=${startDate}&per_page=${perPage}&cursor=${cursor}`;
            const url = `${this.backendUrl}${path}`;
            const data = await this.fetchWithRetry(url);
            
            // Log data source
            if (data._dataSource === 'REAL') {
                console.log('✅ [REAL DATA] Games list are from BallDontLie API');
            } else if (data._dataSource === 'MOCK') {
                console.warn('⚠️ [MOCK DATA] Using simulated games - configure BALLDONTLIE_API_KEY for real data');
            }
            
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Error fetching games list from backend, using mock data:', error);
            const mockData = this.getMockGamesList(startDate, perPage);
            return {
                ...mockData,
                _dataSource: 'MOCK',
                _message: 'Backend unavailable - using mock data'
            };
        }
    }

    async getTeamStats(teamId, season = 2025) {
        const cacheKey = this.getCacheKey('teamStats', { teamId, season });
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // Use Netlify function in production, Express server in development
            const path = this.backendUrl.includes('/.netlify/functions') 
                ? `/team-stats?teamId=${teamId}&season=${season}` 
                : `/api/team-stats?teamId=${teamId}&season=${season}`;
            const url = `${this.backendUrl}${path}`;
            const data = await this.fetchWithRetry(url);
            
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.warn('Error fetching real team stats, using mock data:', error);
            const mockStats = this.getMockTeamStats(teamId);
            return mockStats;
        }
    }

    // The Odds API Methods
    async getOdds(homeTeam, awayTeam) {
        const cacheKey = this.getCacheKey('odds', { homeTeam, awayTeam });
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log(`[CACHE HIT] Odds for ${homeTeam} vs ${awayTeam}`);
            return cached;
        }

        try {
            // Use Netlify function in production, Express server in development
            const path = this.backendUrl.includes('/.netlify/functions') 
                ? `/odds?homeTeam=${homeTeam}&awayTeam=${awayTeam}` 
                : `/api/odds?homeTeam=${homeTeam}&awayTeam=${awayTeam}`;
            const url = `${this.backendUrl}${path}`;
            const data = await this.fetchWithRetry(url);
            
            // Log data source
            if (data._dataSource === 'REAL') {
                console.log(`✅ [REAL DATA] Odds are from The Odds API (${data._apiProvider})`);
            } else if (data._dataSource === 'MOCK') {
                console.warn(`⚠️ [MOCK DATA] Using simulated odds for ${homeTeam} vs ${awayTeam}`);
            }
            
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Error fetching odds for ${homeTeam} vs ${awayTeam}, using mock data:`, error);
            const mockData = this.getMockOdds(homeTeam, awayTeam);
            return {
                ...mockData,
                _dataSource: 'MOCK',
                _message: 'Backend unavailable - using mock data'
            };
        }
    }

    // Mock Data Methods
    getMockGames(date) {
        const games = [
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
                time: '7:30 PM ET',
                period: 0
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
                time: '7:00 PM ET',
                period: 0
            },
            {
                id: 3,
                date: date,
                home_team: {
                    id: 5,
                    abbreviation: 'PHX',
                    city: 'Phoenix',
                    name: 'Suns',
                    full_name: 'Phoenix Suns'
                },
                visitor_team: {
                    id: 6,
                    abbreviation: 'DEN',
                    city: 'Denver',
                    name: 'Nuggets',
                    full_name: 'Denver Nuggets'
                },
                home_team_score: 0,
                visitor_team_score: 0,
                status: 'scheduled',
                time: '10:00 PM ET',
                period: 0
            }
        ];
        
        return { data: games };
    }

    getMockGamesList(startDate, perPage = 10) {
        // Generate mock games across multiple days
        const mockGames = [
            { abbreviations: ['LAL', 'GSW'], names: ['Lakers', 'Warriors'], times: ['19:30'] },
            { abbreviations: ['BOS', 'MIA'], names: ['Celtics', 'Heat'], times: ['19:00'] },
            { abbreviations: ['PHX', 'DEN'], names: ['Suns', 'Nuggets'], times: ['22:00'] },
            { abbreviations: ['LAC', 'NYK'], names: ['Clippers', 'Knicks'], times: ['19:30'] },
            { abbreviations: ['MIL', 'BOS'], names: ['Bucks', 'Celtics'], times: ['20:00'] },
            { abbreviations: ['DAL', 'HOU'], names: ['Mavericks', 'Rockets'], times: ['20:30'] },
            { abbreviations: ['SAS', 'OKC'], names: ['Spurs', 'Thunder'], times: ['21:00'] },
            { abbreviations: ['TOR', 'WAS'], names: ['Raptors', 'Wizards'], times: ['19:30'] },
            { abbreviations: ['ATL', 'CHA'], names: ['Hawks', 'Hornets'], times: ['19:30'] },
            { abbreviations: ['MIN', 'MEM'], names: ['Timberwolves', 'Grizzlies'], times: ['20:00'] }
        ];

        const games = [];
        const startDateObj = this.parseDate(startDate);
        
        for (let i = 0; i < perPage; i++) {
            const dayOffset = Math.floor(i / 3);
            const gameDate = new Date(startDateObj);
            gameDate.setDate(gameDate.getDate() + dayOffset);
            const gameDateStr = this.formatDate(gameDate);
            
            const mockGame = mockGames[i % mockGames.length];
            
            games.push({
                id: i,
                date: gameDateStr,
                home_team: {
                    id: i * 2,
                    abbreviation: mockGame.abbreviations[0],
                    city: mockGame.names[0].split(' ')[0],
                    name: mockGame.names[0],
                    full_name: mockGame.names[0]
                },
                visitor_team: {
                    id: i * 2 + 1,
                    abbreviation: mockGame.abbreviations[1],
                    city: mockGame.names[1].split(' ')[0],
                    name: mockGame.names[1],
                    full_name: mockGame.names[1]
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

    parseDate(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    getMockTeamStats(teamId) {
        const teamSeed = teamId % 30;
        const isGoodTeam = teamSeed < 10;
        
        const baseStats = {
            ppg: isGoodTeam ? 115 + (teamSeed * 1.5) : 105 + (teamSeed * 1.2),
            oppg: isGoodTeam ? 106 + (teamSeed * 0.8) : 110 + (teamSeed * 1.1),
            apg: 24 + (teamSeed % 6),
            rpg: 43 + (teamSeed % 8),
            spg: 7.5 + (teamSeed % 3),
            bpg: 4.5 + (teamSeed % 2.5),
            fg_pct: isGoodTeam ? 0.47 + (teamSeed % 5) * 0.01 : 0.44 + (teamSeed % 5) * 0.01,
            fg3_pct: isGoodTeam ? 0.37 + (teamSeed % 4) * 0.01 : 0.34 + (teamSeed % 4) * 0.01,
            ft_pct: 0.76 + (teamSeed % 8) * 0.01,
            wins: isGoodTeam ? 35 + (teamSeed * 2) : 20 + teamSeed,
            losses: isGoodTeam ? 20 - (teamSeed / 2) : 35 - (teamSeed / 2),
            win_pct: 0,
            last_10: isGoodTeam ? `${7 + (teamSeed % 3)}-${3 - (teamSeed % 3)}` : `${4 + (teamSeed % 2)}-${6 - (teamSeed % 2)}`,
            home_record: isGoodTeam ? `${20 + (teamSeed % 5)}-${10 - (teamSeed % 3)}` : `${12 + (teamSeed % 4)}-${18 - (teamSeed % 4)}`,
            away_record: isGoodTeam ? `${15 + (teamSeed % 3)}-${15 - (teamSeed % 3)}` : `${8 + (teamSeed % 3)}-${22 - (teamSeed % 3)}`,
            offensive_rating: isGoodTeam ? 115 + (teamSeed * 0.8) : 108 + (teamSeed * 0.6),
            defensive_rating: isGoodTeam ? 106 + (teamSeed * 0.5) : 112 + (teamSeed * 0.7),
            net_rating: 0,
            pace: 98 + (teamSeed % 6),
            true_shooting: isGoodTeam ? 0.58 + (teamSeed % 5) * 0.01 : 0.54 + (teamSeed % 5) * 0.01
        };
        
        baseStats.losses = Math.max(10, baseStats.losses);
        baseStats.win_pct = baseStats.wins / (baseStats.wins + baseStats.losses);
        baseStats.net_rating = baseStats.offensive_rating - baseStats.defensive_rating;
        
        baseStats.ppg = Math.round(baseStats.ppg * 10) / 10;
        baseStats.oppg = Math.round(baseStats.oppg * 10) / 10;
        baseStats.offensive_rating = Math.round(baseStats.offensive_rating * 10) / 10;
        baseStats.defensive_rating = Math.round(baseStats.defensive_rating * 10) / 10;
        
        return { data: baseStats };
    }

    getMockOdds(homeTeam, awayTeam) {
        const spread = Math.floor(Math.random() * 10) - 5;
        const homeML = spread < 0 ? -150 - (Math.abs(spread) * 20) : 130 + (spread * 20);
        const awayML = spread > 0 ? -150 - (spread * 20) : 130 + (Math.abs(spread) * 20);
        
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

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
