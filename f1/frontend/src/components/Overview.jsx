// Season overview: a hero for the champion (or the visitor's team), key numbers,
// both championships and every race winner.
import { url } from "../utils/api.js"
import { useApi } from "../utils/useApi.js"
import { formatDate, getTeamColor, isClassified, teamName } from "../utils/f1Data.js"
import {
  Card, DriverCutout, ErrorState, Icon, PositionBadge, ProgressBar, Skeleton, StatTile, TeamBar, useSelectedTeam,
} from "./ui.jsx"

const openTeamPicker = () => document.getElementById("team-picker-open")?.click()

const Overview = () => {
  const selectedTeam = useSelectedTeam()
  const { data, error, loading, retry } = useApi([
    "/api/standings/drivers",
    "/api/standings/constructors",
    "/api/races",
    "/api/results",
    "/api/qualifying",
  ])

  if (error) return <ErrorState onRetry={retry} />
  if (loading || !data) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-[26rem] rounded-[2rem]" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  const [driverStandings, teamStandings, races, results, qualifying] = data
  const driverChampion = driverStandings[0]
  const teamChampion = teamStandings[0]

  // Winner and pole sitter for every round
  const winners = new Map(results.filter((r) => r.position === 1).map((r) => [r.race_id, r]))
  const poles = new Map(qualifying.filter((q) => q.position === 1).map((q) => [q.race_id, q]))
  const distinctWinners = new Set([...winners.values()].map((r) => r.driver_id)).size

  // Pole positions per driver
  const poleCounts = {}
  for (const pole of poles.values()) poleCounts[pole.driver_id] = (poleCounts[pole.driver_id] || 0) + 1
  const [poleLeaderId, poleLeaderCount] = Object.entries(poleCounts).sort((a, b) => b[1] - a[1])[0] || []
  const poleLeader = [...poles.values()].find((p) => p.driver_id === poleLeaderId)

  const team = selectedTeam ? teamStandings.find((t) => t.constructor_id === selectedTeam) : null

  return (
    <div className="space-y-6 lg:space-y-8">
      {team ? (
        <TeamHero team={team} driverStandings={driverStandings} results={results} />
      ) : (
        <ChampionHero champion={driverChampion} poles={poleCounts[driverChampion?.driver_id] || 0} />
      )}

      {/* Key numbers */}
      <div className="rise rise-2 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Constructors' champion"
          value={teamName(teamChampion?.constructor_id, teamChampion?.constructor_name)}
          hint={`${teamChampion?.points} pts · ${teamChampion?.wins} wins`}
          dotColor={getTeamColor(teamChampion?.constructor_id)}
        />
        <StatTile label="Different winners" value={distinctWinners} hint={`Across ${races.length} Grands Prix`} highlight />
        <StatTile
          label="Most poles"
          value={poleLeaderCount ?? "—"}
          hint={poleLeader?.driver_name}
          dotColor={poleLeader ? getTeamColor(poleLeader.constructor_id) : undefined}
        />
        <StatTile label="Grands Prix" value={races.length} hint={`${formatDate(races[0].date)} – ${formatDate(races[races.length - 1].date)}`} />
      </div>

      <div className="rise rise-3 grid gap-6 lg:grid-cols-5">
        {/* Drivers' championship */}
        <Card className="lg:col-span-3" title="Drivers' championship" action={<ViewAll href={url("/standings")} />} bodyClassName="pb-3 pt-2">
          <ol>
            {driverStandings.slice(0, 10).map((s) => (
              <li key={s.standing_id}>
                <a
                  href={url(`/drivers/${s.driver_id}`)}
                  className="row-link grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-2.5 sm:px-6"
                >
                  <PositionBadge position={s.position} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <TeamBar constructorId={s.constructor_id} className="h-3.5" />
                      <span className="truncate text-sm font-semibold">{s.driver_name}</span>
                    </span>
                    <span className="mt-2 block pl-3">
                      <ProgressBar value={s.points} max={driverChampion.points} color={getTeamColor(s.constructor_id)} />
                    </span>
                  </span>
                  <span className="tabular w-12 text-right font-display text-base font-bold">{s.points}</span>
                </a>
              </li>
            ))}
          </ol>
        </Card>

        {/* Constructors' championship */}
        <Card className="lg:col-span-2" title="Constructors" action={<ViewAll href={url("/standings?view=constructors")} />} bodyClassName="pb-3 pt-2">
          <ol>
            {teamStandings.map((s) => (
              <li key={s.standing_id}>
                <a
                  href={url(`/constructors?team=${s.constructor_id}`)}
                  className="row-link grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-2.5 sm:px-6"
                >
                  <PositionBadge position={s.position} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{teamName(s.constructor_id, s.constructor_name)}</span>
                    <span className="mt-2 block">
                      <ProgressBar value={s.points} max={teamChampion.points} color={getTeamColor(s.constructor_id)} />
                    </span>
                  </span>
                  <span className="tabular w-12 text-right font-display text-base font-bold">{s.points}</span>
                </a>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Every race winner */}
      <Card className="rise rise-4" title="Race winners" action={<ViewAll href={url("/races")} label="Calendar" />} bodyClassName="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left">
                <th className="label px-5 py-3 font-semibold sm:px-6">Rd</th>
                <th className="label px-2 py-3 font-semibold">Grand Prix</th>
                <th className="label px-2 py-3 font-semibold">Date</th>
                <th className="label px-2 py-3 font-semibold">Winner</th>
                <th className="label px-5 py-3 font-semibold sm:px-6">Pole</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {races.map((race) => {
                const winner = winners.get(race.race_id)
                const pole = poles.get(race.race_id)
                return (
                  <tr key={race.race_id} className="row-link">
                    <td className="tabular px-5 py-3 font-display font-bold text-faint sm:px-6">{String(race.round).padStart(2, "0")}</td>
                    <td className="px-2 py-3">
                      <a href={url(`/races?round=${race.round}`)} className="font-semibold hover:text-team">
                        {race.race_name.replace(" Grand Prix", "")}
                      </a>
                    </td>
                    <td className="tabular whitespace-nowrap px-2 py-3 text-muted">{formatDate(race.date)}</td>
                    <td className="px-2 py-3">
                      {winner ? <DriverCell driverId={winner.driver_id} name={winner.driver_name} constructorId={winner.constructor_id} /> : "—"}
                    </td>
                    <td className="px-5 py-3 sm:px-6">
                      {pole ? <DriverCell driverId={pole.driver_id} name={pole.driver_name} constructorId={pole.constructor_id} /> : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Heroes
// ---------------------------------------------------------------------------

const HeroStat = ({ label, value, highlight }) => (
  <div>
    <p className="label">{label}</p>
    <p className={`mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl ${highlight ? "text-team" : ""}`}>{value}</p>
  </div>
)

const ChampionHero = ({ champion, poles }) => {
  const [first, ...rest] = (champion?.driver_name || "").split(" ")
  return (
    <section className="hero rise min-h-[26rem] sm:min-h-[28rem]">
      <div className="relative z-10 flex h-full max-w-[34rem] flex-col p-6 sm:p-10">
        <p className="label text-team">2024 World Champion</p>
        <h2 className="mt-3 font-display font-black leading-[0.9] tracking-tight">
          <span className="block text-3xl text-muted sm:text-4xl">{first}</span>
          <span className="block text-5xl sm:text-7xl">{rest.join(" ")}</span>
        </h2>
        <p className="mt-3 text-sm text-muted">{teamName(champion?.constructor_id, champion?.constructor_name)} · fourth consecutive title</p>

        <div className="mt-8 flex gap-8">
          <HeroStat label="Points" value={champion?.points} highlight />
          <HeroStat label="Wins" value={champion?.wins} />
          <HeroStat label="Poles" value={poles} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={url("/standings")} className="btn-team">Standings</a>
          <button type="button" onClick={openTeamPicker} className="btn">Choose your team</button>
        </div>
      </div>
      <DriverCutout
        driverId={champion?.driver_id}
        className="absolute -right-6 bottom-0 h-[78%] w-auto opacity-40 sm:right-0 sm:h-[105%] sm:opacity-100"
      />
    </section>
  )
}

const TeamHero = ({ team, driverStandings, results }) => {
  // The team's two drivers with the most points for it
  const pointsFor = {}
  let podiums = 0
  for (const r of results) {
    if (r.constructor_id !== team.constructor_id) continue
    pointsFor[r.driver_id] = (pointsFor[r.driver_id] || 0) + (r.points || 0)
    if (isClassified(r) && r.position <= 3) podiums += 1
  }
  const lineup = Object.entries(pointsFor).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id]) => id)
  const names = lineup.map((id) => driverStandings.find((d) => d.driver_id === id)?.driver_name?.split(" ").slice(-1)[0]).filter(Boolean)

  return (
    <section className="hero rise min-h-[26rem] sm:min-h-[28rem]">
      <div className="relative z-10 flex h-full max-w-[34rem] flex-col p-6 sm:p-10">
        <p className="label text-team">Your team · P{team.position} constructors</p>
        <h2 className="mt-3 font-display text-5xl font-black leading-[0.9] tracking-tight sm:text-7xl">
          {teamName(team.constructor_id, team.constructor_name)}
        </h2>
        <p className="mt-3 text-sm text-muted">{names.join(" & ")}</p>

        <div className="mt-8 flex gap-8">
          <HeroStat label="Points" value={team.points} highlight />
          <HeroStat label="Wins" value={team.wins} />
          <HeroStat label="Podiums" value={podiums} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={url(`/constructors?team=${team.constructor_id}`)} className="btn-team">Team page</a>
          <button type="button" onClick={openTeamPicker} className="btn">Change team</button>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 flex h-[78%] items-end opacity-40 sm:h-[100%] sm:opacity-100">
        {lineup.map((id, i) => (
          <DriverCutout key={id} driverId={id} className={`h-full w-auto ${i === 1 ? "-ml-24 hidden scale-90 md:block" : ""}`} />
        ))}
      </div>
    </section>
  )
}

const ViewAll = ({ href, label = "View all" }) => (
  <a href={href} className="inline-flex items-center gap-0.5 text-sm font-semibold text-muted hover:text-team">
    {label}
    <Icon name="chevron" />
  </a>
)

const DriverCell = ({ driverId, name, constructorId }) => (
  <a href={url(`/drivers/${driverId}`)} className="inline-flex items-center gap-2 whitespace-nowrap hover:text-team">
    <TeamBar constructorId={constructorId} className="h-3.5" />
    {name}
  </a>
)

export default Overview
