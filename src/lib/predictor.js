// NBA Betting Predictor Algorithm
// Multi-factor weighted prediction system
// Ported to web app (removed Chrome-specific code)

export class NBAPredictor {
    constructor() {
        // Weights for different factors (must sum to 1.0)
        this.weights = {
            elo: 0.30,           // Team strength rating
            recentForm: 0.25,    // Last 10 games performance
            offenseRating: 0.15, // Offensive efficiency
            defenseRating: 0.15, // Defensive efficiency
            homeAdvantage: 0.10, // Home court advantage
            restDays: 0.05       // Rest between games
        };
        
        // Initialize Elo ratings (baseline 1500)
        this.eloRatings = {
            'LAL': 1550, 'GSW': 1580, 'BOS': 1620, 'MIA': 1520,
            'PHX': 1540, 'DEN': 1600, 'MIL': 1590, 'PHI': 1570,
            'BKN': 1480, 'DAL': 1530, 'MEM': 1510, 'CLE': 1490,
            'NYK': 1500, 'ATL': 1470, 'CHI': 1460, 'TOR': 1480,
            'MIN': 1520, 'NOP': 1490, 'LAC': 1540, 'SAC': 1500,
            'IND': 1470, 'OKC': 1450, 'UTA': 1480, 'POR': 1430,
            'WAS': 1420, 'CHA': 1400, 'SAS': 1440, 'ORL': 1460,
            'DET': 1410, 'HOU': 1430
        };
        
        // Constants
        this.HOME_ADVANTAGE_POINTS = 3.5;
        this.ELO_K_FACTOR = 20;
        this.ELO_POINTS_PER_RATING = 25; // 25 Elo points = 1 point spread
    }

    async generatePrediction(game, homeStats, awayStats, odds) {
        const homeTeam = game.home_team;
        const awayTeam = game.visitor_team;
        
        // Calculate individual factors
        const factors = {
            elo: this.calculateEloFactor(homeTeam.abbreviation, awayTeam.abbreviation),
            recentForm: this.calculateRecentFormFactor(homeStats, awayStats),
            offenseRating: this.calculateOffenseFactor(homeStats, awayStats),
            defenseRating: this.calculateDefenseFactor(homeStats, awayStats),
            homeAdvantage: this.calculateHomeAdvantageFactor(),
            restDays: this.calculateRestFactor(homeStats, awayStats)
        };
        
        // Calculate weighted prediction score (-100 to +100, positive favors home)
        let predictionScore = 0;
        for (const [factor, value] of Object.entries(factors)) {
            predictionScore += value * this.weights[factor];
        }
        
        // Convert to point spread
        const predictedSpread = this.scoreToSpread(predictionScore);
        
        // Calculate confidence (1-10)
        const confidence = this.calculateConfidence(factors, predictedSpread, odds);
        
        // Generate moneyline prediction
        const moneylinePick = predictedSpread < 0 ? homeTeam : awayTeam;
        const moneylineConfidence = this.calculateMoneylineConfidence(predictedSpread, confidence);
        
        // Generate reasoning
        const reasoning = this.generateReasoning(factors, homeTeam, awayTeam, homeStats, awayStats);
        
        return {
            spread: {
                pick: predictedSpread < 0 ? homeTeam : awayTeam,
                line: Math.abs(predictedSpread),
                actualLine: this.getActualSpread(odds),
                confidence: confidence,
                reasoning: reasoning.spread
            },
            moneyline: {
                pick: moneylinePick,
                odds: this.getMoneylineOdds(odds, moneylinePick),
                confidence: moneylineConfidence,
                reasoning: reasoning.moneyline
            },
            factors: factors,
            rawScore: predictionScore
        };
    }

    calculateEloFactor(homeAbbr, awayAbbr) {
        const homeElo = this.eloRatings[homeAbbr] || 1500;
        const awayElo = this.eloRatings[awayAbbr] || 1500;
        const eloDiff = homeElo - awayElo;
        
        // Normalize to -100 to +100 scale
        return Math.max(-100, Math.min(100, eloDiff / 2));
    }

    calculateRecentFormFactor(homeStats, awayStats) {
        // Parse last 10 games record
        const parseRecord = (record) => {
            if (!record) return 0.5;
            const [wins, losses] = record.split('-').map(Number);
            return wins / (wins + losses);
        };
        
        const homeForm = parseRecord(homeStats.data.last_10);
        const awayForm = parseRecord(awayStats.data.last_10);
        
        // Convert to -100 to +100 scale
        return (homeForm - awayForm) * 200;
    }

    calculateOffenseFactor(homeStats, awayStats) {
        const homeOffRating = homeStats.data.offensive_rating || 110;
        const awayOffRating = awayStats.data.offensive_rating || 110;
        
        // League average is typically around 110
        const diff = homeOffRating - awayOffRating;
        return Math.max(-100, Math.min(100, diff * 5));
    }

    calculateDefenseFactor(homeStats, awayStats) {
        const homeDefRating = homeStats.data.defensive_rating || 110;
        const awayDefRating = awayStats.data.defensive_rating || 110;
        
        // Lower defensive rating is better
        const diff = awayDefRating - homeDefRating;
        return Math.max(-100, Math.min(100, diff * 5));
    }

    calculateHomeAdvantageFactor() {
        // Home team gets a consistent advantage
        return 40; // Represents about 3-4 points
    }

    calculateRestFactor(homeStats, awayStats) {
        // In a real implementation, would check actual game schedule
        // For now, return neutral
        return 0;
    }

    scoreToSpread(score) {
        // Convert prediction score to point spread
        // Score of 100 = about 10 point spread
        return score / 10;
    }

    calculateConfidence(factors, predictedSpread, odds) {
        // Base confidence on factor agreement and spread size
        let confidence = 5;
        
        // Check factor agreement
        const positiveFactors = Object.values(factors).filter(f => f > 0).length;
        const factorAgreement = positiveFactors / Object.keys(factors).length;
        
        if (factorAgreement > 0.8 || factorAgreement < 0.2) {
            confidence += 3; // Strong agreement
        } else if (factorAgreement > 0.6 || factorAgreement < 0.4) {
            confidence += 1; // Moderate agreement
        }
        
        // Adjust for spread size
        const spreadSize = Math.abs(predictedSpread);
        if (spreadSize > 8) {
            confidence += 1; // Large spread = more confident
        } else if (spreadSize < 3) {
            confidence -= 1; // Close game = less confident
        }
        
        // Compare with actual odds if available
        const actualSpread = this.getActualSpread(odds);
        if (actualSpread !== null) {
            const spreadDiff = Math.abs(predictedSpread - actualSpread);
            if (spreadDiff < 2) {
                confidence += 1; // Agrees with Vegas
            } else if (spreadDiff > 5) {
                confidence -= 1; // Disagrees with Vegas
            }
        }
        
        return Math.max(1, Math.min(10, confidence));
    }

    calculateMoneylineConfidence(spread, spreadConfidence) {
        // Moneyline confidence based on spread size
        let confidence = spreadConfidence;
        
        const absSpread = Math.abs(spread);
        if (absSpread > 10) {
            confidence = Math.min(10, confidence + 1);
        } else if (absSpread < 5) {
            confidence = Math.max(1, confidence - 2);
        }
        
        return confidence;
    }

    getActualSpread(odds) {
        if (!odds || !odds.bookmakers || odds.bookmakers.length === 0) {
            return null;
        }
        
        const spreads = odds.bookmakers[0].markets.find(m => m.key === 'spreads');
        if (spreads && spreads.outcomes.length > 0) {
            return spreads.outcomes[0].point;
        }
        
        return null;
    }

    getMoneylineOdds(odds, team) {
        if (!odds || !odds.bookmakers || odds.bookmakers.length === 0) {
            return 'N/A';
        }
        
        const moneyline = odds.bookmakers[0].markets.find(m => m.key === 'h2h');
        if (moneyline) {
            const teamOdds = moneyline.outcomes.find(o => 
                o.name.includes(team.name) || team.full_name.includes(o.name)
            );
            if (teamOdds) {
                return teamOdds.price > 0 ? `+${teamOdds.price}` : `${teamOdds.price}`;
            }
        }
        
        return 'N/A';
    }

    generateReasoning(factors, homeTeam, awayTeam, homeStats, awayStats) {
        const reasons = {
            spread: [],
            moneyline: []
        };
        
        // Elo-based reasoning
        if (Math.abs(factors.elo) > 30) {
            const stronger = factors.elo > 0 ? homeTeam.name : awayTeam.name;
            reasons.spread.push(`${stronger} have superior Elo rating (${Math.abs(factors.elo).toFixed(0)} point advantage)`);
            reasons.moneyline.push(`${stronger} are the stronger team overall`);
        }
        
        // Recent form reasoning
        if (Math.abs(factors.recentForm) > 20) {
            const better = factors.recentForm > 0 ? homeTeam.name : awayTeam.name;
            const record = factors.recentForm > 0 ? homeStats.data.last_10 : awayStats.data.last_10;
            reasons.spread.push(`${better} in better form (${record} last 10 games)`);
        }
        
        // Offensive/Defensive reasoning
        if (Math.abs(factors.offenseRating) > 20) {
            const better = factors.offenseRating > 0 ? homeTeam.name : awayTeam.name;
            reasons.spread.push(`${better} have superior offensive efficiency`);
        }
        
        if (Math.abs(factors.defenseRating) > 20) {
            const better = factors.defenseRating > 0 ? homeTeam.name : awayTeam.name;
            reasons.spread.push(`${better} have stronger defensive rating`);
        }
        
        // Home advantage
        if (factors.homeAdvantage > 0) {
            reasons.spread.push(`${homeTeam.name} benefit from home court advantage`);
            reasons.moneyline.push(`Home court advantage favors ${homeTeam.name}`);
        }
        
        // Add win percentage comparison
        const homeWinPct = homeStats.data.win_pct;
        const awayWinPct = awayStats.data.win_pct;
        if (Math.abs(homeWinPct - awayWinPct) > 0.15) {
            const better = homeWinPct > awayWinPct ? homeTeam.name : awayTeam.name;
            const pct = Math.max(homeWinPct, awayWinPct);
            reasons.moneyline.push(`${better} have ${(pct * 100).toFixed(1)}% win rate this season`);
        }
        
        // Ensure we always have at least one reason
        if (reasons.spread.length === 0) {
            reasons.spread.push('Close matchup with slight edge based on overall metrics');
        }
        if (reasons.moneyline.length === 0) {
            reasons.moneyline.push('Statistical models favor this outcome');
        }
        
        return reasons;
    }

    // Update Elo ratings after game completion
    updateEloRatings(homeTeam, awayTeam, homeScore, awayScore) {
        const homeElo = this.eloRatings[homeTeam] || 1500;
        const awayElo = this.eloRatings[awayTeam] || 1500;
        
        // Calculate expected outcome
        const expectedHome = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400));
        
        // Actual outcome
        const actualHome = homeScore > awayScore ? 1 : 0;
        
        // Update ratings
        this.eloRatings[homeTeam] = homeElo + this.ELO_K_FACTOR * (actualHome - expectedHome);
        this.eloRatings[awayTeam] = awayElo + this.ELO_K_FACTOR * ((1 - actualHome) - (1 - expectedHome));
    }
}
