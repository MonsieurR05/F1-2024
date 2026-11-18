// Teams: a grid of all ten teams, and a detail view for one team (?team=<id>).
import { useEffect, useMemo, useState } from "react"
import { url } from "../utils/api.js"
import { useApi } from "../utils/useApi.js"
import { getTheme } from "../utils/theme.js"
import { finishLabel, getPowerUnit, getTeamColor, isClassified, teamName } from "../utils/f1Data.js"
import {
  BackLink, Card, DriverAvatar, DriverCutout, EmptyState, ErrorState, HeroFrame, HeroStat, LoadingCards,
  PageHeader, PositionBadge, ProgressBar, SearchInput, Skeleton, StatTile, useTeamTheme,
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
          <button type="button" className="font-medium text-team hover:underline" onClick={() => setSearch("")}>Clear search</button>
        </EmptyState>
      ) : (
        <ul className="rise rise-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((team) => {
            const color = getTeamColor(team.constructor_id)
            const drivers = driverStandings.filter((d) => d.constructor_id === team.constructor_id)
            return (
              <li key={team.constructor_id}>
                <button
                  type="button"
                  onClick={() => onOpen(team.constructor_id)}
                  // Each card carries its own team's colours
                  style={{ "--team": color, "--team-2": getTheme(team.constructor_id).secondary, boxShadow: `inset 3px 0 0 ${color}` }}
                  className="card card-link group flex h-full w-full flex-col overflow-hidden p-5 pl-6 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="display truncate text-3xl group-hover:text-team">{teamName(team.constructor_id, team.constructor_name)}</p>
                      <p className="mt-1 text-[13px] text-muted">{getPowerUnit(team.constructor_id)} power</p>
                    </div>
                    <span className="display slant text-3xl text-faint">P{team.position}</span>
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <p className="display text-5xl text-team">{team.points}<span className="label ml-2 align-baseline">pts</span></p>
                    <p className="font-mono text-[13px] text-muted">{team.wins} {team.wins === 1 ? "win" : "wins"}</p>
                  </div>
                  <div className="mt-3"><ProgressBar value={team.points} max={leader} color={color} /></div>

                  <p className="mt-4 truncate text-[13px] text-muted">
                    {drivers.length ? drivers.map((d) => d.driver_name.split(" ").slice(-1)[0]).join(", ") : "-"}
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

  // Theme the page in this team's colours
  useTeamTheme(view ? teamId : null)

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
        <Skeleton className="h-[26rem]" />
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
    <div className="space-y-12 lg:space-y-16">
      <BackLink onClick={onBack}>All teams</BackLink>

      <HeroFrame
        headingAs="h1"
        className="min-h-[26rem] sm:min-h-[28rem]"
        eyebrow={`${team.nationality}, ${getPowerUnit(team.constructor_id)} power`}
        title={<span className="slant block text-6xl sm:text-[6.5rem]">{team.name.replace(/ F1 Team$/, "")}</span>}
        sub={lineup.slice(0, 2).map((l) => l.driver.full_name).join(" and ")}
        stats={
          <>
            <HeroStat label="Championship" value={standing ? `P${standing.position}` : "-"} highlight />
            <HeroStat label="Points" value={standing?.points ?? 0} />
          </>
        }
        art={
          <div className="absolute bottom-0 right-0 flex h-[70%] items-end opacity-40 lg:h-full lg:opacity-100">
            {lineup.slice(0, 2).map(({ driver }, i) => (
              <DriverCutout key={driver.driver_id} driverId={driver.driver_id} className={`h-full w-auto ${i === 1 ? "-ml-28 hidden scale-90 lg:block" : ""}`} />
            ))}
          </div>
        }
      />

      <div className="rise rise-2 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        <StatTile label="Wins" value={standing?.wins ?? 0} hint="Points include sprints" highlight />
        <StatTile label="Podiums" value={podiums} hint="Grands Prix only" />
        <StatTile label="One-two finishes" value={oneTwos} />
        <StatTile label="Drivers used" value={lineup.length} />
      </div>

      {/* Drivers */}
      <Card className="rise rise-3" title="Drivers" plain>
        <ul>
          {lineup.map(({ driver, starts, points, best }) => (
            <li key={driver.driver_id}>
              <a href={url(`/drivers/${driver.driver_id}`)} className="row-link group flex items-center gap-4 py-3 pr-1">
                <DriverAvatar driverId={driver.driver_id} name={driver.full_name} constructorId={team.constructor_id} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold group-hover:text-team">{driver.full_name}</span>
                  <span className="block text-[13px] text-muted">{starts} {starts === 1 ? "start" : "starts"}, best finish {best ? `P${best}` : "-"}</span>
                </span>
                <span className="text-right">
                  <span className="tabular block font-mono font-medium">{points}</span>
                  <span className="block text-xs text-muted">race pts</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Card>

      {/* Round by round */}
      <Card className="rise rise-4" title="Results by round" plain>
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left">
                <th className="label px-4 py-2.5 font-medium sm:px-5">Rd</th>
                <th className="label px-2 py-2.5 font-medium">Grand Prix</th>
                <th className="label px-2 py-2.5 font-medium">Finishes</th>
                <th className="label w-40 px-4 py-2.5 font-medium sm:px-5">Race points</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map(({ race, results }, i) => (
                <tr key={race.race_id}>
                  <td className="tabular px-4 py-2.5 font-mono text-[13px] text-faint sm:px-5">{String(race.round).padStart(2, "0")}</td>
                  <td className="px-2 py-2.5">
                    <a href={url(`/races?round=${race.round}`)} className="font-medium hover:text-team">
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
                      <span className="tabular w-8 text-right font-mono">{roundPoints[i]}</span>
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
