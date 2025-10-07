"use client"

import { useState, useEffect } from "react"

/**
 * DriverDetail Component
 *
 * Displays comprehensive information about a specific F1 driver including
 * personal details, team information, statistics, and 2024 season results.
 *
 * Recent changes:
 * - Added support for reserve drivers (Lawson, Doohan, Colapinto, Bearman)
 * - Fixed image fallback system for better reliability
 * - Updated team color mapping for 2024 season
 * - Enhanced statistics calculation and display
 */
const DriverDetail = () => {
  // Component state for driver data and loading
  const [driver, setDriver] = useState(null)
  const [driverResults, setDriverResults] = useState([])
  const [driverStanding, setDriverStanding] = useState(null)
  const [allRaces, setAllRaces] = useState([])
  const [loading, setLoading] = useState(true)

  // Extract driver ID from the current URL path
  const getDriverIdFromUrl = () => {
    const path = window.location.pathname
    const segments = path.split("/")
    return segments[segments.length - 1]
  }

  // Driver portrait image URLs organized by team and with fallbacks
  const getDriverImageUrls = (driverId, driverName) => {
    const imageUrls = {
      // Red Bull Racing drivers
      perez: ["https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/4472.png&w=350&h=254"],
      max_verstappen: ["https://formula1review.com/wp-content/uploads/2024/03/max-verstappen.png"],

      // Mercedes drivers
      hamilton: ["https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/868.png"],
      russell: [
        "https://cdn.racingnews365.com/Riders/Russell/_570x570_crop_center-center_none/f1_2024_gr_mer_lg.png?v=1708704486",
      ],

      // Aston Martin drivers
      alonso: ["https://formula1review.com/wp-content/uploads/2024/03/fernando-alonso.png"],
      stroll: [
        "https://cdn.racingnews365.com/Riders/Stroll/_570x570_crop_center-center_none/f1_2024_ls_ast_lg.png?v=1708704434",
      ],

      // Ferrari drivers
      leclerc: ["https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png"],
      sainz: ["https://a.espncdn.com/i/headshots/rpm/players/full/4686.png"],

      // McLaren drivers
      norris: ["https://www.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png"],
      piastri: ["https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png"],

      // Alpine drivers
      gasly: ["https://www.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png"],
      ocon: ["https://formula1review.com/wp-content/uploads/2024/03/esteban-ocon.png"],

      // Williams drivers
      albon: ["https://www.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png"],
      sargeant: ["https://www.formula1.com/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png"],

      // RB (AlphaTauri) drivers
      tsunoda: ["https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/5652.png&w=350&h=254"],
      ricciardo: ["https://www.formula1.com/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png"],

      // Haas drivers
      kevin_magnussen: [
        "https://www.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png",
      ],
      hulkenberg: ["https://a.espncdn.com/combiner/i?img=/i/headshots/rpm/players/full/4396.png&w=350&h=254"],

      // Kick Sauber drivers
      bottas: ["https://www.formula1.com/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png"],
      zhou: ["https://www.formula1.com/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png"],

      // Reserve and substitute drivers
      lawson: [
        "https://cdn.racingnews365.com/_570x570_crop_center-center_none/lawson-cutout-2025-vcarb.png?v=1743592719",
      ],
      doohan: ["https://cdn.racingnews365.com/_570x570_crop_center-center_none/jacdoo01.png?v=1741600637"],
      colapinto: [
        "https://www.kymillman.com/wp-content/uploads/f1/products/f1-signed-photos/franco-colapinto/franco-colapinto.png",
      ],
      bearman: [
        "https://www.kymillman.com/wp-content/uploads/f1/products/f1-signed-photos/oliver-bearman/oliver-bearman.png",
      ],
    }

    // Return driver-specific URLs or fallback to placeholder
    return (
      imageUrls[driverId] || [
        "/placeholder.svg?height=128&width=128&query=" + encodeURIComponent(driverName + " F1 driver portrait"),
      ]
    )
  }

  // Get current image URL with fallback handling
  const getCurrentImageUrl = (driverId, driverName, attemptIndex = 0) => {
    const urls = getDriverImageUrls(driverId, driverName)
    return (
      urls[attemptIndex] ||
      "/placeholder.svg?height=128&width=128&query=" + encodeURIComponent(driverName + " F1 driver portrait")
    )
  }

  // Team brand colors for styling the driver profile header
  const getDriverTeamColors = (constructorId) => {
    const teamColors = {
      red_bull: { primary: "#0600EF", secondary: "#DC143C" },
      mercedes: { primary: "#00D2BE", secondary: "#000000" },
      ferrari: { primary: "#DC143C", secondary: "#FFFF00" },
      mclaren: { primary: "#FF8700", secondary: "#000000" },
      aston_martin: { primary: "#006F62", secondary: "#CEDC00" },
      alpine: { primary: "#0090FF", secondary: "#FF1801" },
      williams: { primary: "#005AFF", secondary: "#FFFFFF" },
      rb: { primary: "#6692FF", secondary: "#FFFFFF" },
      sauber: { primary: "#00D100", secondary: "#000000" },
      haas: { primary: "#FFFFFF", secondary: "#DC143C" },
    }
    return teamColors[constructorId] || { primary: "#E10600", secondary: "#FFFFFF" }
  }

  // Country flag emojis for nationality display
  const getCountryFlag = (nationality) => {
    const flags = {
      Dutch: "🇳🇱",
      British: "🇬🇧",
      Monégasque: "🇲🇨",
      Spanish: "🇪🇸",
      Mexican: "🇲🇽",
      Australian: "🇦🇺",
      Canadian: "🇨🇦",
      German: "🇩🇪",
      French: "🇫🇷",
      Japanese: "🇯🇵",
      Finnish: "🇫🇮",
      Danish: "🇩🇰",
      Thai: "🇹🇭",
      Chinese: "🇨🇳",
      American: "🇺🇸",
      Argentine: "🇦🇷",
      Italian: "🇮🇹",
      Swiss: "🇨🇭",
      Austrian: "🇦🇹",
      Belgian: "🇧🇪",
    }
    return flags[nationality] || "🏁"
  }

  // Fetch all driver data when component mounts
  useEffect(() => {
    const fetchDriverDetails = async () => {
      const driverId = getDriverIdFromUrl()

      try {
        // Parallel API calls for better performance
        const [driverRes, resultsRes, standingsRes, racesRes] = await Promise.all([
          fetch(`http://localhost:5000/api/drivers/${driverId}`),
          fetch("http://localhost:5000/api/results"),
          fetch("http://localhost:5000/api/standings/drivers"),
          fetch("http://localhost:5000/api/races"),
        ])

        const driverData = await driverRes.json()
        const allResults = await resultsRes.json()
        const standings = await standingsRes.json()
        const racesData = await racesRes.json()

        // Filter results for this specific driver
        const driverResults = allResults.filter((result) => result.driver_id === driverId)
        const standing = standings.find((s) => s.driver_id === driverId)

        setDriver(driverData)
        setDriverResults(driverResults)
        setDriverStanding(standing)
        setAllRaces(racesData)
      } catch (error) {
        console.error("Error fetching driver details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDriverDetails()
  }, [])

  // Calculate comprehensive driver performance statistics
  const getDriverStats = (results) => {
    const wins = results.filter((r) => r.position === 1).length
    const podiums = results.filter((r) => r.position <= 3).length
    const points = results.reduce((sum, r) => sum + (r.points || 0), 0)
    const races = results.length
    const positions = results.filter((r) => r.position && r.position > 0).map((r) => r.position)
    const bestFinish = positions.length > 0 ? Math.min(...positions) : null
    const dnfs = results.filter((r) => !r.position || r.position === 0).length

    return {
      wins,
      podiums,
      points,
      races,
      bestFinish: bestFinish || "N/A",
      dnfs,
    }
  }

  // Helper to convert race ID to race name
  const getRaceNameById = (raceId) => {
    const race = allRaces.find((r) => r.race_id === raceId)
    return race ? race.race_name : `Race ${raceId}`
  }

  // Determine driver's current team from most recent result
  const getDriverCurrentTeam = () => {
    const recentResult = driverResults.find((r) => r.driver_id === driver?.driver_id)
    return recentResult ? recentResult.constructor_id : null
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="h-6 bg-gray-700 rounded mb-2"></div>
          <div className="h-6 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  // Error state - driver not found
  if (!driver) {
    return (
      <div className="text-center py-12">
        <div className="text-f1-gray text-lg">Driver not found.</div>
        <a href="/drivers" className="text-f1-red hover:underline mt-4 inline-block">
          ← Back to Drivers
        </a>
      </div>
    )
  }

  // Calculate stats and get team styling
  const stats = getDriverStats(driverResults)
  const currentTeam = getDriverCurrentTeam()
  const teamColors = getDriverTeamColors(currentTeam)

  return (
    <div className="space-y-6">
      {/* Navigation back to drivers list */}
      <a href="/drivers" className="flex items-center space-x-2 text-f1-red hover:text-red-400 transition-colors">
        <span>←</span>
        <span>Back to Drivers</span>
      </a>

      {/* Driver profile header with team colors */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.secondary} 100%)`,
        }}
      >
        <div className="p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Driver portrait with fallback handling */}
              <img
                src={getCurrentImageUrl(driver.driver_id, driver.full_name, 0) || "/placeholder.svg"}
                alt={`${driver.full_name} portrait`}
                className="w-32 h-32 object-cover rounded-full border-4 border-white/20"
                onError={(e) => {
                  // Try next image URL or fallback to placeholder
                  const urls = getDriverImageUrls(driver.driver_id, driver.full_name)
                  const currentSrc = e.target.src
                  const currentIndex = urls.findIndex((url) => url === currentSrc)
                  const nextIndex = currentIndex + 1

                  if (nextIndex < urls.length) {
                    e.target.src = urls[nextIndex]
                  } else {
                    e.target.src =
                      "/placeholder.svg?height=128&width=128&query=" +
                      encodeURIComponent(driver.full_name + " F1 driver portrait")
                  }
                }}
              />
              <div>
                {/* Driver number and flag */}
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-4xl">{getCountryFlag(driver.nationality)}</span>
                  <div className="text-6xl font-bold">#{driver.permanent_number || "N/A"}</div>
                </div>
                {/* Driver name and details */}
                <h1 className="text-4xl font-bold mb-2">{driver.full_name}</h1>
                <p className="text-lg opacity-90">{driver.nationality}</p>
                <p className="text-sm opacity-75">{driver.code}</p>
              </div>
            </div>
            {/* Championship position */}
            {driverStanding && (
              <div className="text-right">
                <div className="text-4xl font-bold">P{driverStanding.position}</div>
                <div className="text-lg opacity-90">Championship</div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics and information section */}
        <div className="bg-gray-50 p-8">
          {/* Key performance metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-gray-700 text-sm font-medium mb-2">Championship Position</div>
              <div className="text-4xl font-black text-gray-900">
                {driverStanding ? driverStanding.position : "N/A"}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-gray-700 text-sm font-medium mb-2">Points</div>
              <div className="text-4xl font-black text-gray-900">
                {driverStanding ? driverStanding.points : stats.points}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-gray-700 text-sm font-medium mb-2">Wins</div>
              <div className="text-4xl font-black text-gray-900">
                {driverStanding ? driverStanding.wins : stats.wins}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-gray-700 text-sm font-medium mb-2">Podiums</div>
              <div className="text-4xl font-black text-gray-900">{stats.podiums}</div>
            </div>
          </div>

          {/* Detailed information grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Full Name:</span>
                  <span className="font-semibold text-gray-900">
                    {driver.given_name} {driver.family_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nationality:</span>
                  <span className="font-semibold text-gray-900 flex items-center space-x-2">
                    <span>{getCountryFlag(driver.nationality)}</span>
                    <span>{driver.nationality}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(driver.date_of_birth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date().getFullYear() - new Date(driver.date_of_birth).getFullYear()} years old
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Racing Number:</span>
                  <span className="font-semibold text-gray-900">#{driver.permanent_number || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Driver Code:</span>
                  <span className="font-semibold text-gray-900 font-mono">{driver.code}</span>
                </div>
              </div>
            </div>

            {/* Current team and season performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Current Team & 2024 Season</h3>

              {/* Team information with brand colors */}
              {driverStanding && (
                <div className="text-center p-4 rounded-lg mb-6" style={{ backgroundColor: `${teamColors.primary}15` }}>
                  <div className="text-2xl font-bold" style={{ color: teamColors.primary }}>
                    {driverStanding.constructor_name}
                  </div>
                  <div className="text-gray-600 text-sm">Current Team</div>
                </div>
              )}

              {/* Performance statistics grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-black text-gray-900">
                    P{driverStanding ? driverStanding.position : "N/A"}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">Championship Position</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-black text-gray-900">
                    {driverStanding ? driverStanding.points : stats.points}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">Points</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-black text-gray-900">{stats.races}</div>
                  <div className="text-gray-600 text-sm font-medium">Races</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-black text-gray-900">P{stats.bestFinish}</div>
                  <div className="text-gray-600 text-sm font-medium">Best Finish</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-black text-gray-900">
                    {driverStanding ? driverStanding.wins : stats.wins}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">Wins</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-2xl font-black text-gray-900">{stats.dnfs}</div>
                  <div className="text-gray-600 text-sm font-medium">DNFs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2024 season results list */}
      {driverResults.length > 0 && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4" style={{ backgroundColor: teamColors.primary }}>
            <h3 className="text-xl font-bold text-black">2024 Season Results</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {driverResults.map((result, index) => (
              <div
                key={result.result_id}
                className={`p-4 border-b border-gray-700 ${
                  result.position <= 3 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {/* Position indicator with podium colors */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        result.position === 1
                          ? "bg-yellow-500 text-yellow-900"
                          : result.position === 2
                            ? "bg-gray-400 text-gray-900"
                            : result.position === 3
                              ? "bg-orange-600 text-orange-100"
                              : "bg-gray-600 text-white"
                      }`}
                    >
                      {result.position || "DNF"}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{getRaceNameById(result.race_id)}</div>
                      <div className="text-sm text-f1-gray">{result.constructor_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">{result.points} pts</div>
                    <div className="text-sm text-f1-gray">{result.time || result.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DriverDetail
