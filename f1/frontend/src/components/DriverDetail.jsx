// Profile of one driver: key stats, personal details and every 2024 result.
import { useMemo, useState } from "react"
import { url } from "../utils/api.js"
import { useApi } from "../utils/useApi.js"
import { ageOn, finishLabel, formatDate, getTeamColor, isClassified, teamName } from "../utils/f1Data.js"
import {
  BackLink, Card, DriverCutout, EmptyState, ErrorState, HERO_CUTOUT, HeroFrame, HeroStat, PositionBadge, Skeleton,
  StatTile, TeamBar, useTeamTheme,
} from "./ui.jsx"

// The driver ID is the last part of the URL: /drivers/norris/ -> "norris"
const driverIdFromUrl = () => {
  const segments = window.location.pathname.split("/").filter(Boolean)
  return decodeURIComponent(segments[segments.length - 1] || "")
}

const DriverDetail = () => {
  const [driverId] = useState(() => (typeof window === "undefined" ? null : driverIdFromUrl()))
  const id = driverId ? encodeURIComponent(driverId) : null
  const { data, error, loading, retry } = useApi(
    id ? [`/api/drivers/${id}`, `/api/results?driver_id=${id}`, "/api/standings/drivers", "/api/races"] : null,
  )

  const view = useMemo(() => {
    if (!data) return null
    const [driver, results, standings, races] = data
    const standing = standings.find((s) => s.driver_id === driver.driver_id)
    const racesById = new Map(races.map((r) => [r.race_id, r]))
    const classified = results.filter(isClassified)
    const finishes = classified.map((r) => r.position)
    return {
      driver,
      results,
      standing,
      racesById,
      team: standing?.constructor_id ?? results[results.length - 1]?.constructor_id,
      stats: {
        starts: results.length,
        wins: results.filter((r) => r.position === 1).length,
        podiums: results.filter((r) => isClassified(r) && r.position <= 3).length,
        bestFinish: finishes.length ? Math.min(...finishes) : null,
        averageFinish: finishes.length ? (finishes.reduce((a, b) => a + b, 0) / finishes.length).toFixed(1) : null,
        dnfs: results.length - classified.length,
        maxPoints: Math.max(0, ...results.map((r) => r.points || 0)),
      },
    }
  }, [data])

  // Theme the page in the driver's team colours
  useTeamTheme(view?.team)

  if (error?.status === 404) {
    return (
      <div className="space-y-4">
        <BackLink href={url("/drivers")}>All drivers</BackLink>
        <EmptyState title="Driver not found">There's no 2024 driver with the ID "{driverId}".</EmptyState>
      </div>
    )
  }
  if (error) return <ErrorState onRetry={retry} />
  if (loading || !view) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-[26rem]" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  const { driver, results, standing, racesById, team, stats } = view
  const teamColor = getTeamColor(team)

  return (
    <div className="space-y-12 lg:space-y-16">
      <BackLink href={url("/drivers")}>All drivers</BackLink>

      {/* Hero */}
      <HeroFrame
        headingAs="h1"
        className="min-h-[26rem] sm:min-h-[28rem]"
        eyebrow={`${driver.code}, ${driver.nationality}`}
        title={
          <>
            <span className="block text-4xl text-muted sm:text-5xl">{driver.given_name}</span>
            <span className="slant block text-6xl sm:text-[6.5rem]">{driver.family_name}</span>
          </>
        }
        sub={
          standing && (
            <a href={url(`/constructors?team=${standing.constructor_id}`)} className="inline-flex items-center gap-2 font-medium hover:text-fg">
              <TeamBar constructorId={standing.constructor_id} className="h-3.5" />
              {teamName(standing.constructor_id, standing.constructor_name)}
            </a>
          )
        }
        stats={
          <>
            <HeroStat label="Championship" value={standing ? `P${standing.position}` : "-"} highlight />
            <HeroStat label="Points" value={standing?.points ?? 0} />
          </>
        }
        art={
          <>
            {/* Car number painted on the slab, like a livery */}
            {driver.permanent_number && (
              <span
                className="display slant pointer-events-none absolute right-[4%] top-4 select-none text-[9rem] text-black/20 sm:text-[13rem]"
                aria-hidden="true"
              >
                {driver.permanent_number}
              </span>
            )}
            <DriverCutout driverId={driver.driver_id} className={HERO_CUTOUT} />
          </>
        }
      />

      {/* Key numbers */}
      <div className="rise rise-2 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        <StatTile label="Podiums" value={stats.podiums} hint={`From ${stats.starts} starts`} highlight />
        <StatTile label="Wins" value={stats.wins} hint={standing ? `P${standing.position} in the championship` : undefined} />
        <StatTile label="Best finish" value={stats.bestFinish ? `P${stats.bestFinish}` : "-"} hint={stats.averageFinish ? `Average P${stats.averageFinish}` : undefined} />
        <StatTile label="Race starts" value={stats.starts} hint={`${stats.dnfs} not classified`} />
      </div>

      {results.length === 0 ? (
        <EmptyState title="No race starts in 2024">{driver.full_name} didn't start a Grand Prix this season.</EmptyState>
      ) : (
        <div className="rise rise-3 grid gap-12 lg:grid-cols-3">
          {/* Points per race */}
          <Card title="Points by round" className="lg:col-span-2">
            <div className="flex h-44 items-end gap-1" role="img" aria-label={`Points scored in each of ${results.length} races`}>
              {results.map((r) => {
                const race = racesById.get(r.race_id)
                return (
                  <div key={r.result_id} className="group relative flex h-full flex-1 flex-col justify-end">
                    <div
                      className="w-full transition-opacity group-hover:opacity-75"
                      style={{
                        height: `${stats.maxPoints ? Math.max(2, (r.points / stats.maxPoints) * 100) : 2}%`,
                        background: r.points > 0 ? teamColor : "rgb(255 255 255 / 0.08)",
                      }}
                    />
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-fg px-2 py-1 font-mono text-xs text-bg group-hover:block">
                      R{race?.round} {race?.race_name.replace(" Grand Prix", "")}: {r.points} pts
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex justify-between font-mono text-xs text-faint">
              <span>Round {racesById.get(results[0].race_id)?.round}</span>
              <span>Round {racesById.get(results[results.length - 1].race_id)?.round}</span>
            </div>
          </Card>

          {/* Personal details */}
          <Card title="Details">
            <dl className="text-sm">
              <Detail label="Full name">{driver.given_name} {driver.family_name}</Detail>
              <Detail label="Nationality">{driver.nationality}</Detail>
              <Detail label="Date of birth">{formatDate(driver.date_of_birth, "long")}</Detail>
              <Detail label="Age">{ageOn(driver.date_of_birth)}</Detail>
              <Detail label="Car number">{driver.permanent_number ?? "-"}</Detail>
              <Detail label="Driver code">{driver.code}</Detail>
              {driver.url && (
                <Detail label="Biography">
                  <a href={driver.url} target="_blank" rel="noopener noreferrer" className="font-medium text-team hover:underline">Wikipedia</a>
                </Detail>
              )}
            </dl>
          </Card>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <Card className="rise rise-4" title="2024 results" plain>
          <div className="overflow-x-auto">
            <table className="data-table w-full min-w-[620px] text-sm">
              <thead>
                <tr className="text-left">
                  <th className="label px-4 py-2.5 font-medium sm:px-5">Rd</th>
                  <th className="label px-2 py-2.5 font-medium">Grand Prix</th>
                  <th className="label px-2 py-2.5 text-right font-medium">Grid</th>
                  <th className="label px-2 py-2.5 text-center font-medium">Finish</th>
                  <th className="label px-2 py-2.5 font-medium">Time / status</th>
                  <th className="label px-4 py-2.5 text-right font-medium sm:px-5">Pts</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const race = racesById.get(r.race_id)
                  return (
                    <tr key={r.result_id}>
                      <td className="tabular px-4 py-2.5 font-mono text-[13px] text-faint sm:px-5">{String(race?.round).padStart(2, "0")}</td>
                      <td className="px-2 py-2.5">
                        <a href={url(`/races?round=${race?.round}`)} className="font-medium hover:text-team">
                          {race?.race_name.replace(" Grand Prix", "")}
                        </a>
                        {r.constructor_id !== team && (
                          <span className="ml-2 text-xs text-muted">({teamName(r.constructor_id, r.constructor_name)})</span>
                        )}
                      </td>
                      <td className="tabular px-2 py-2.5 text-right font-mono text-[13px] text-muted">{r.grid || "Pit lane"}</td>
                      <td className="px-2 py-2.5 text-center"><PositionBadge label={finishLabel(r)} /></td>
                      <td className="tabular px-2 py-2.5 font-mono text-[13px] text-muted">{r.time || r.status}</td>
                      <td className="tabular px-4 py-2.5 text-right font-mono sm:px-5">{r.points}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

const Detail = ({ label, children }) => (
  <div className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0">
    <dt className="text-muted">{label}</dt>
    <dd className="text-right font-medium">{children}</dd>
  </div>
)

export default DriverDetail
