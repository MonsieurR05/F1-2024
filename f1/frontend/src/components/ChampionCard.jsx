"use client"

import { useState, useEffect } from "react"

/**
 * ChampionCard Component
 *
 * Displays the current 2024 F1 season champions for both drivers and constructors.
 * Features modern glassmorphism design with hover effects and decorative elements.
 *
 * Recent changes:
 * - Updated styling to use new Tailwind color palette 
 * - Added backdrop-blur effects
 * - Enhanced hover animations with scale and shadow effects
 * - Added decorative gradient circles for visual appeal
 * - Improved loading state with matching design
 */
const ChampionCard = () => {
  // State for storing champion data and loading status
  const [champions, setChampions] = useState({
    driver: null,
    constructor: null,
  })
  const [loading, setLoading] = useState(true)

  // Fetch championship data from the Flask API
  useEffect(() => {
    const fetchChampions = async () => {
      try {
        // Parallel API calls for better performance
        const [driverStandingsRes, constructorStandingsRes] = await Promise.all([
          fetch("http://localhost:5000/api/standings/drivers"),
          fetch("http://localhost:5000/api/standings/constructors"),
        ])

        const driverStandings = await driverStandingsRes.json()
        const constructorStandings = await constructorStandingsRes.json()

        // Set the top driver and constructor as champions
        setChampions({
          driver: driverStandings[0] || null,
          constructor: constructorStandings[0] || null,
        })
      } catch (error) {
        console.error("Error fetching champions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChampions()
  }, [])

  // Loading state with glassmorphism design
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 animate-pulse border border-white/10">
            <div className="h-8 bg-white/10 rounded-lg mb-6"></div>
            <div className="h-10 bg-white/10 rounded-lg mb-4"></div>
            <div className="h-6 bg-white/10 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Driver Champion Card */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-accent-500/20 to-accent-600/20 backdrop-blur-sm rounded-2xl p-8 border border-accent-400/20 hover:border-accent-400/40 transition-all duration-300 transform hover:scale-105 hover:shadow-large">
        <div className="relative z-10 text-center">
          {/* Card Header */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-3xl">🏆</span>
            <h3 className="text-2xl font-bold text-white">Driver Champion</h3>
          </div>

          {/* Champion Information */}
          {champions.driver ? (
            <>
              {/* Driver Name with gradient text */}
              <div className="text-4xl font-bold bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent mb-3">
                {champions.driver.driver_name}
              </div>
              {/* Points and Wins */}
              <div className="text-white/80 font-semibold text-lg mb-2">
                {champions.driver.points} points • {champions.driver.wins} wins
              </div>
              {/* Team Name */}
              <div className="text-white/60 text-sm">{champions.driver.constructor_name}</div>
            </>
          ) : (
            <div className="text-white/60">No data available</div>
          )}
        </div>

        {/* Decorative background elements for visual appeal */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent-500/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Constructor Champion Card */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-secondary-600/20 to-secondary-700/20 backdrop-blur-sm rounded-2xl p-8 border border-secondary-500/20 hover:border-secondary-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-large">
        <div className="relative z-10 text-center">
          {/* Card Header */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-3xl">🏆</span>
            <h3 className="text-2xl font-bold text-white">Constructor Champion</h3>
          </div>

          {/* Champion Information */}
          {champions.constructor ? (
            <>
              {/* Constructor Name with gradient text */}
              <div className="text-4xl font-bold bg-gradient-to-r from-secondary-200 to-secondary-400 bg-clip-text text-transparent mb-3">
                {champions.constructor.constructor_name}
              </div>
              {/* Points and Wins */}
              <div className="text-white/80 font-semibold text-lg">
                {champions.constructor.points} points • {champions.constructor.wins} wins
              </div>
            </>
          ) : (
            <div className="text-white/60">No data available</div>
          )}
        </div>

        {/* Decorative background elements for visual appeal */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary-500/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
      </div>
    </div>
  )
}

export default ChampionCard
