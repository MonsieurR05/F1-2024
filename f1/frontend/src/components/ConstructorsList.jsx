// Teams: a grid of all ten teams, and a detail view for one team (?team=<id>).
import { useEffect, useMemo, useState } from "react"
import { url } from "../utils/api.js"
import { useApi } from "../utils/useApi.js"
import { finishLabel, getPowerUnit, getTeamColor, isClassified, teamName } from "../utils/f1Data.js"
import {
  BackLink, Card, DriverAvatar, EmptyState, ErrorState, LoadingCards, PageHeader, PositionBadge,
  ProgressBar, SearchInput, Skeleton, StatTile, TeamBadge,
} from "./ui.jsx"

// Keep the selected team in the URL so team pages can be linked and the back button works
const readTeamFromUrl = () => new URLSearchParams(window.location.search).get("team")

const ConstructorsList = () => {
  const [teamId, setTeamId] = useState(null)

  useEffect(() => {
    setTeamId(readTeamFromUrl())
    const onPopState = () => setTeamId(readTeamFromUrl())
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const openTeam = (id) => {
    const params = new URLSearchParams(window.location.search)
    if (id) params.set("team", id)
    else params.delete("team")
    const query = params.toString()
    window.history.pushState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`)
    setTeamId(id)
    window.scrollTo({ top: 0 })
  }

  return teamId ? <TeamDetail teamId={teamId} onBack={() => openTeam(null)} /> : <TeamGrid onOpen={openTeam} />
}

// ---------------------------------------------------------------------------
// All teams
// ---------------------------------------------------------------------------

const TeamGrid = ({ onOpen }) => {
  const [search, setSearch] = useState("")
  const { data, error, loading, retry } = useApi(["/api/standings/constructors", "/api/standings/drivers"])

  const header = <PageHeader title="Teams" subtitle="The ten constructors of the 2024 championship" />
  if (error) return <>{header}<ErrorState onRetry={retry} /></>

  const term = search.trim().toLowerCase()
  const [teamStandings = [], driverStandings = []] = data || []
  const leader = teamStandings[0]?.points || 0
  const visible = teamStandings.filter(
    (t) => !term || [t.constructor_name, getPowerUnit(t.constructor_id)].some((f) => f.toLowerCase().includes(term)),
  )

  return (
    <div className="space-y-4">
      {header}
      <SearchInput value={search} onChange={setSearch} placeholder="Search teams or engines" label="Search teams" />

      {loading || !data ? (
        <LoadingCards count={6} className="h-48" />
      ) : visible.length === 0 ? (
        <EmptyState title="No teams found">
          Nothing matches "{search}".{" "}
          <button type="button" className="font-medium text-accent hover:underline" onClick={() => setSearch("")}>Clear search</button>
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((team) => {
            const color = getTeamColor(team.constructor_id)
            const drivers = driverStandings.filter((d) => d.constructor_id === team.constructor_id)
            return (
              <li key={team.constructor_id}>
                <button
                  type="button"
                  onClick={() => onOpen(team.constructor_id)}
                  className="card group relative flex h-full w-full flex-col overflow-hidden p-5 text-left transition-shadow hover:shadow-pop"
                >
                  <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
                  <div className="flex items-start gap-3">
                    <TeamBadge constructorId={team.constructor_id} name={team.constructor_name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold group-hover:text-accent">{teamName(team.constructor_id, team.constructor_name)}</p>
                      <p className="text-sm text-muted">{getPowerUnit(team.constructor_id)} power</p>
                    </div>
                    <PositionBadge position={team.position} />
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="label">Points</p>
                      <p className="tabular mt-1 text-2xl font-semibold">{team.points}</p>
                    </div>
                    <p className="text-sm text-muted">{team.wins} {team.wins === 1 ? "win" : "wins"}</p>
                  </div>
                  <div className="mt-3"><ProgressBar value={team.points} max={leader} color={color} /></div>

                  <p className="mt-4 truncate border-t border-line pt-3 text-sm text-muted">
                    {drivers.length ? drivers.map((d) => d.driver_name.split(" ").slice(-1)[0]).join(" · ") : "—"}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// One team
// ---------------------------------------------------------------------------

const TeamDetail = ({ teamId, onBack }) => {
  const id = encodeURIComponent(teamId)
  const { data, error, loading, retry } = useApi([
    `/api/constructors/${id}`,
    `/api/results?constructor_id=${id}`,
    "/api/standings/constructors",
    "/api/races",
    "/api/drivers",
  ])

  const view = useMemo(() => {
    if (!data) return null
    const [team, results, standings, races, drivers] = data
    const driversById = new Map(drivers.map((d) => [d.driver_id, d]))

    // Everyone who raced for the team, with their starts and race points for it
    const lineup = new Map()
    for (const r of results) {
      const entry = lineup.get(r.driver_id) || { driver: driversById.get(r.driver_id), starts: 0, points: 0, best: null }
      entry.starts += 1
      entry.points += r.points || 0
      if (isClassified(r)) entry.best = entry.best === null ? r.position : Math.min(entry.best, r.position)
      lineup.set(r.driver_id, entry)
    }

    // Results grouped by round
    const byRace = new Map()
    for (const r of results) byRace.set(r.race_id, [...(byRace.get(r.race_id) || []), r])

    return {
      team,
      standing: standings.find((s) => s.constructor_id === team.constructor_id),
      lineup: [...lineup.values()].sort((a, b) => b.starts - a.starts || b.points - a.points),
      rounds: races.filter((race) => byRace.has(race.race_id)).map((race) => ({ race, results: byRace.get(race.race_id) })),
      driversById,
      podiums: results.filter((r) => isClassified(r) && r.position <= 3).length,
      oneTwos: [...byRace.values()].filter((rs) => rs.some((r) => r.position === 1) && rs.some((r) => r.position === 2)).length,
    }
  }, [data])

  if (error?.status === 404) {
    return (
      <div className="space-y-4">
        <BackLink onClick={onBack}>All teams</BackLink>
        <EmptyState title="Team not found">There's no 2024 team with the ID "{teamId}".</EmptyState>
      </div>
    )
  }
  if (error) return <ErrorState onRetry={retry} />
  if (loading || !view) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-28" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  const { team, standing, lineup, rounds, driversById, podiums, oneTwos } = view
  const color = getTeamColor(team.constructor_id)
  const roundPoints = rounds.map(({ results }) => results.reduce((sum, r) => sum + (r.points || 0), 0))
  const maxRoundPoints = Math.max(1, ...roundPoints)

  return (
    <div className="space-y-6">
      <BackLink onClick={onBack}>All teams</BackLink>

      {/* Header */}
      <section className="card relative overflow-hidden">
        <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <TeamBadge constructorId={team.constructor_id} name={team.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{team.name}</h1>
            <p className="mt-1 text-sm text-muted">{team.nationality} · {getPowerUnit(team.constructor_id)} power unit</p>
          </div>
          {standing && (
            <div className="sm:text-right">
              <p className="label">Championship</p>
              <p className="tabular mt-1 text-3xl font-semibold">P{standing.position}</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Points" value={standing?.points ?? 0} hint="Including sprint races" />
        <StatTile label="Wins" value={standing?.wins ?? 0} />
        <StatTile label="Podiums" value={podiums} hint="Grands Prix only" />
        <StatTile label="One-two finishes" value={oneTwos} />
      </div>

      {/* Drivers */}
      <Card title="Drivers" bodyClassName="">
        <ul className="divide-y divide-line">
          {lineup.map(({ driver, starts, points, best }) => (
            <li key={driver.driver_id}>
              <a href={url(`/drivers/${driver.driver_id}`)} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-subtle sm:px-5">
                <DriverAvatar driverId={driver.driver_id} name={driver.full_name} constructorId={team.constructor_id} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{driver.full_name}</span>
                  <span className="block text-sm text-muted">{starts} {starts === 1 ? "start" : "starts"} · best {best ? `P${best}` : "—"}</span>
                </span>
                <span className="text-right">
                  <span className="tabular block font-semibold">{points}</span>
                  <span className="block text-xs text-muted">race pts</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Card>

      {/* Round by round */}
      <Card title="Results by round" bodyClassName="">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="label px-4 py-2.5 font-medium sm:px-5">Rd</th>
                <th className="label px-2 py-2.5 font-medium">Grand Prix</th>
                <th className="label px-2 py-2.5 font-medium">Finishes</th>
                <th className="label w-40 px-4 py-2.5 font-medium sm:px-5">Race points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rounds.map(({ race, results }, i) => (
                <tr key={race.race_id} className="transition-colors hover:bg-subtle">
                  <td className="tabular px-4 py-2.5 text-muted sm:px-5">{race.round}</td>
                  <td className="px-2 py-2.5">
                    <a href={url(`/races?round=${race.round}`)} className="font-medium hover:text-accent">
                      {race.race_name.replace(" Grand Prix", "")}
                    </a>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="flex flex-wrap gap-3">
                      {results.map((r) => (
                        <span key={r.result_id} className="inline-flex items-center gap-1.5">
                          <span className="text-xs font-medium text-muted">{driversById.get(r.driver_id)?.code}</span>
                          <PositionBadge label={finishLabel(r)} />
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 sm:px-5">
                    <span className="flex items-center gap-3">
                      <span className="tabular w-8 text-right font-semibold">{roundPoints[i]}</span>
                      <span className="flex-1"><ProgressBar value={roundPoints[i]} max={maxRoundPoints} color={color} /></span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default ConstructorsList
