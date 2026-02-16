# 🏀 NBA Betting Predictor Web App

A beautiful, modern web application for AI-powered NBA game predictions and betting analysis. Converted from the original Chrome extension to a full-stack React web app.

## Features

✨ **Intelligent Predictions**
- Multi-factor weighted prediction system
- Spread and moneyline picks with confidence ratings
- Detailed reasoning for each prediction
- Advanced Elo rating system

🎨 **Beautiful UI**
- Dark basketball aesthetic with team colors
- Responsive design for mobile and desktop
- Interactive game cards and predictions
- Real-time factor breakdown visualizations

⚙️ **Flexible Backend**
- Node.js/Express backend for secure API key management
- Support for BallDontLie and The Odds API
- Built-in mock data for development
- Caching for better performance

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Express.js
- **APIs**: BallDontLie, The Odds API
- **Deployment Ready**: Vercel, Netlify, Heroku compatible

## Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Installation

1. **Clone the repository** (or navigate to the project directory)
   ```bash
   cd nba-predictor-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

### Development

**Run both frontend and backend concurrently:**
```bash
npm run dev:all
```

Or run them separately:
```bash
# Terminal 1 - Frontend (http://localhost:5173)
npm run dev:frontend

# Terminal 2 - Backend (http://localhost:3001)
npm run dev:backend
```

### Testing

The app works perfectly with **mock data** - no API keys required to get started!

1. Open http://localhost:5173 in your browser
2. Browse through mock NBA games
3. Click any game to see detailed predictions
4. Use the settings panel to optionally add real API keys

## API Keys (Optional)

To use real data instead of mock predictions:

### BallDontLie API
- Sign up at: https://www.balldontlie.io/
- Free tier includes game data
- Add your key in Settings panel or `.env.local`

### The Odds API
- Sign up at: https://the-odds-api.com/
- Free tier limited requests
- Add your key in Settings panel or `.env.local`

**Note**: The app works great with mock data for development and testing!

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build the frontend
npm run build

# Deploy the 'dist' folder
netlify deploy --prod --dir=dist
```

### Traditional Hosting (Heroku, etc.)
```bash
# Build frontend
npm run build

# Backend runs with
npm run start
```

## Project Structure

```
nba-predictor-webapp/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx
│   │   ├── DateNavigation.jsx
│   │   ├── GamesList.jsx
│   │   ├── GameCard.jsx
│   │   ├── GameDetail.jsx
│   │   ├── PredictionCard.jsx
│   │   ├── FactorsBreakdown.jsx
│   │   ├── TeamComparison.jsx
│   │   └── SettingsPanel.jsx
│   ├── lib/                 # Core logic
│   │   ├── predictor.js     # NBAPredictor class
│   │   └── api.js           # APIManager class
│   ├── App.jsx              # Main app component
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── server/
│   └── index.js             # Express backend
├── public/
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Features in Detail

### 📊 Prediction Algorithm

The NBAPredictor uses a weighted multi-factor analysis:

- **Elo Ratings** (30%) - Team strength tracking
- **Recent Form** (25%) - Last 10 games performance
- **Offensive Efficiency** (15%) - Points per possession
- **Defensive Efficiency** (15%) - Points allowed per possession
- **Home Advantage** (10%) - 3.5 point boost
- **Rest Days** (5%) - Recovery impact

Generates:
- Point spread predictions with confidence (1-10)
- Moneyline picks with implied odds
- Detailed reasoning for each prediction
- Factor breakdown visualization

### 🎮 Interactive Dashboard

- **Date Navigation**: Browse games by date
- **Game Selection**: Click any game for detailed predictions
- **Live Updates**: Refresh button for latest data
- **Settings Panel**: Manage API keys and test connections
- **Responsive Design**: Works on phones, tablets, desktops

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Customization

### Add Your Own Factors

Edit `src/lib/predictor.js`:
```javascript
this.weights = {
  elo: 0.30,
  recentForm: 0.25,
  offenseRating: 0.15,
  defenseRating: 0.15,
  homeAdvantage: 0.10,
  restDays: 0.05,
  // Add your own factor here
  myCustomFactor: 0.05  // Must sum to 1.0
};
```

### Customize Colors

Edit `src/lib/api.js` or components to change:
- Team colors
- UI theme
- Confidence meter colors
- Accent colors

## Performance

- **Caching**: 5-minute response cache reduces API calls
- **Memoization**: React optimization for large game lists
- **Lazy Loading**: Components load on demand
- **Optimized Bundle**: ~45KB gzipped (frontend only)

## Troubleshooting

### Backend not connecting
```bash
# Check if backend is running
curl http://localhost:3001/health

# Should return: { "status": "ok", "timestamp": "..." }
```

### Mock data not showing
- Clear browser cache
- Check browser console for errors
- Ensure you're accessing http://localhost:5173 (not 3000)

### API keys not working
- Double-check key in Settings panel
- Verify API limits (some free tiers are limited)
- Check server logs for error messages

## License

MIT License - feel free to use for personal or commercial projects

## Disclaimer

⚠️ **For Entertainment Only**: This is a statistical analysis tool. Sports betting involves risk. Do your own research, never bet more than you can afford to lose, and gamble responsibly.

## Support

- 📝 Check GitHub issues for common problems
- 💬 Create a discussion for questions
- 🐛 Report bugs with reproduction steps

---

**Made with ❤️ for NBA fans and data nerds** 🏀📊
