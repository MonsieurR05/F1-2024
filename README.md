# F1 2024 Season Data Explorer

A comprehensive web application for exploring the 2024 Formula 1 season data, built with Flask backend and Astro + React frontend. This project provides detailed analytics, driver profiles, team information, race results, and standings with a modern, responsive interface.

## 🏁 Features

### Backend Features
- **SQLite Database**: Normalized F1 data with 7 relational tables
- **Flask REST API**: Comprehensive endpoints with SQLAlchemy ORM
- **Real-time Data**: Fetched from the official Ergast Developer API
- **CORS Support**: Enabled for seamless frontend integration
- **Error Handling**: Robust error handling and validation
- **Jupyter Integration**: Interactive notebooks for data exploration

### Frontend Features
- **Modern UI**: Built with Astro + React + Tailwind CSS
- **Responsive Design**: Mobile-first approach with beautiful animations
- **Interactive Components**: Real-time data exploration and filtering
- **Search Functionality**: Advanced search across drivers, teams, and races
- **Circuit Visualizations**: High-quality track layouts
- **Performance Analytics**: Detailed statistics and championship standings
- **Dark Theme**: Modern dark UI with red F1 accents

### Data Coverage
- **20+ Drivers**: Complete 2024 F1 driver roster with profiles
- **10 Teams**: All constructor teams with detailed information
- **24 Races**: Full race calendar with results and qualifying data
- **Circuit Details**: Track layouts, lap records, and technical specifications
- **Championship Standings**: Real-time driver and constructor standings

## 📁 Project Structure

\`\`\`
f1-2024-project/
├── backend/
│   ├── notebooks/
│   │   ├── 01_database_setup.ipynb    # Database creation and population
│   │   └── 02_api_tester.ipynb        # API endpoint testing
│   ├── data/
│   │   └── f1_2024.db                 # SQLite database (auto-generated)
│   ├── models.py                      # SQLAlchemy database models
│   ├── app.py                         # Flask application and API routes
│   ├── requirements.txt               # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChampionCard.jsx        # Championship leaders display
    │   │   ├── ConstructorsList.jsx    # Teams listing and details
    │   │   ├── DriverDetail.jsx        # Individual driver profiles
    │   │   ├── DriversList.jsx         # Drivers listing with search
    │   │   ├── RacesList.jsx           # Race calendar and circuit details
    │   │   ├── StandingsView.jsx       # Championship standings
    │   │   └── StatsCard.jsx           # Season statistics overview
    │   ├── layouts/
    │   │   └── Layout.astro            # Main layout with navigation
    │   └── pages/
    │       ├── index.astro             # Homepage
    │       ├── drivers.astro           # Drivers page
    │       ├── drivers/[driver_id].astro # Dynamic driver pages
    │       ├── constructors.astro      # Teams page
    │       ├── races.astro             # Races page
    │       └── standings.astro         # Standings page
    ├── public
    ├── astro.config.mjs                # Astro configuration
    ├── package.json                    # Node.js dependencies
    └── tailwind.config.mjs             # Tailwind CSS configuration

## 🚀 How to Run

### Backend Setup

1. **Open terminal and navigate to the backend directory:**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Start the Flask API server:**
   \`\`\`bash
   python app.py
   \`\`\`
   
   The API will be available at `http://localhost:5000`

   **Note:** The Ergast API is currently unavailable, so all backend data is pre-populated and ready to use.

### Frontend Setup

1. **Open another terminal and navigate to the frontend directory:**
   \`\`\`bash
   cd frontend
   \`\`\`

2. **installing node modules:**
   \`\`\`bash
   npm i
   \`\`\`

   \`\`\`or just
   npm i
   \`\`\`

3. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

   \`\`\` or just
   npm run dev
   \`\`\`
   
   
   The frontend will be available at `http://localhost:4321`

## 🔌 API Endpoints

- `/api/drivers` - All drivers
- `/api/constructors` - All teams
- `/api/races` - Race calendar
- `/api/standings/drivers` - Driver standings
- `/api/standings/constructors` - Constructor standings
