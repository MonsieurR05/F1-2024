# F1 2024 Season Data Explorer

A comprehensive web application for exploring the 2024 Formula 1 season data, built with Flask backend and Astro + React frontend. This project provides detailed analytics, driver profiles, team information, race results, and standings with a modern, responsive interface.

## 🏁 Features

### Backend Features
- **SQLite Database**: Normalized F1 data with 7 relational tables
- **Flask REST API**: Comprehensive endpoints with SQLAlchemy ORM
- **Season Data**: Loaded from the Ergast-compatible Jolpica F1 API and shipped in the repo as a SQLite file
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

```
F1-2024/
└── f1/
    ├── backend/
    │   ├── notebooks/
    │   │   ├── 01_database_setup.ipynb    # Database creation and population
    │   │   └── 02_api_tester.ipynb        # API endpoint testing
    │   ├── data/
    │   │   └── f1_2024.db                 # SQLite database (included in the repo)
    │   ├── models.py                      # SQLAlchemy database models
    │   ├── app.py                         # Flask application and API routes
    │   ├── requirements.txt               # Python dependencies for the API server
    │   └── requirements-dev.txt           # Extra dependencies for the notebooks
    ├── documentation/                     # Meeting notes, wireframes, schema diagram
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
        │   ├── utils/
        │   │   ├── api.js                  # API base URL (PUBLIC_API_URL)
        │   │   ├── driverIds.js            # 2024 driver IDs (build-time fallback)
        │   │   └── f1Data.js               # Shared driver images, team colors, flags
        │   ├── layouts/
        │   │   └── Layout.astro            # Main layout with navigation
        │   └── pages/
        │       ├── index.astro             # Homepage
        │       ├── about.astro             # About page
        │       ├── drivers.astro           # Drivers page
        │       ├── drivers/[driver_id].astro # Dynamic driver pages
        │       ├── constructors.astro      # Teams page
        │       ├── races.astro             # Races page
        │       └── standings.astro         # Standings page
        ├── public/
        ├── .env.example                    # Example frontend configuration
        ├── astro.config.mjs                # Astro configuration
        ├── package.json                    # Node.js dependencies
        └── tailwind.config.js              # Tailwind CSS configuration
```

## 🚀 How to Run

### Backend Setup

1. **Open a terminal and go to the backend directory:**
   ```bash
   cd f1/backend
   ```

2. **Install the Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask API server:**
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5000` (try `http://localhost:5000/api/health`).

   The server only listens on your own machine and runs without the debugger by default.
   Set `FLASK_DEBUG=1` to enable debug mode, or `FLASK_HOST` / `FLASK_PORT` to change where it listens.

### Frontend Setup

1. **Open another terminal and go to the frontend directory:**
   ```bash
   cd f1/frontend
   ```

2. **Install the node modules:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:4321`.

The frontend talks to the API at `http://localhost:5000` by default. To use a different
backend, copy `.env.example` to `.env` and change `PUBLIC_API_URL`.

### Rebuilding the Database (optional)

The database in `f1/backend/data/f1_2024.db` is already populated, so this is only needed
if you want to regenerate it. The original Ergast API has been retired, so the notebook
uses its community-run successor, [Jolpica F1](https://github.com/jolpica/jolpica-f1).

```bash
cd f1/backend
pip install -r requirements-dev.txt
jupyter notebook notebooks/01_database_setup.ipynb
```

## 🔌 API Endpoints

- `/api/health` - Health check and endpoint list
- `/api/drivers` - All drivers
- `/api/drivers/<driver_id>` - One driver
- `/api/constructors` - All teams
- `/api/constructors/<constructor_id>` - One team
- `/api/races` - Race calendar
- `/api/races/<race_id>` - One race
- `/api/races/<race_id>/results` - Results of one race
- `/api/races/<race_id>/qualifying` - Qualifying of one race
- `/api/results` - All race results (filter with `?driver_id=` and/or `?constructor_id=`)
- `/api/qualifying` - All qualifying results
- `/api/standings/drivers` - Driver standings
- `/api/standings/constructors` - Constructor standings
