// Season overview: champions, key numbers, both championships and every race winner.
import { url } from "../utils/api.js"
import { useApi } from "../utils/useApi.js"
import { formatDate, getTeamColor, teamName } from "../utils/f1Data.js"
import { Card, ErrorState, Icon, LoadingCards, PositionBadge, ProgressBar, Skeleton, StatTile, TeamBar } from "./ui.jsx"

const Overview = () => {
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
      <div className="space-y-6">
        <LoadingCards count={4} className="h-28" />
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

  // Driver with the most pole positions
  const poleCounts = {}
  for (const pole of poles.values()) poleCounts[pole.driver_id] = (poleCounts[pole.driver_id] || 0) + 1
  const [poleLeaderId, poleLeaderCount] = Object.entries(poleCounts).sort((a, b) => b[1] - a[1])[0] || []
  const poleLeader = [...poles.values()].find((p) => p.driver_id === poleLeaderId)

  const topDrivers = driverStandings.slice(0, 10)
  const driverMax = driverChampion?.points || 0
  const teamMax = teamChampion?.points || 0

  return (
    <div className="space-y-6">
      {/* Key numbers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Drivers' champion"
          value={driverChampion?.driver_name}
          hint={`${driverChampion?.points} pts · ${driverChampion?.wins} wins · ${teamName(driverChampion?.constructor_id, driverChampion?.constructor_name)}`}
          accentColor={getTeamColor(driverChampion?.constructor_id)}
        />
        <StatTile
          label="Constructors' champion"
          value={teamName(teamChampion?.constructor_id, teamChampion?.constructor_name)}
          hint={`${teamChampion?.points} pts · ${teamChampion?.wins} wins`}
          accentColor={getTeamColor(teamChampion?.constructor_id)}
        />
        <StatTile label="Different winners" value={distinctWinners} hint={`Across ${races.length} Grands Prix`} />
        <StatTile
          label="Most pole positions"
          value={poleLeader?.driver_name ?? "—"}
          hint={poleLeaderCount ? `${poleLeaderCount} poles` : undefined}
          accentColor={poleLeader ? getTeamColor(poleLeader.constructor_id) : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Drivers' championship */}
        <Card
          className="lg:col-span-3"
          title="Drivers' championship"
          action={<ViewAll href={url("/standings")} />}
          bodyClassName=""
        >
          <ol className="divide-y divide-line">
            {topDrivers.map((s) => (
              <li key={s.standing_id}>
                <a
                  href={url(`/drivers/${s.driver_id}`)}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-subtle sm:px-5"
                >
                  <PositionBadge position={s.position} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <TeamBar constructorId={s.constructor_id} />
                      <span className="truncate text-sm font-medium">{s.driver_name}</span>
                    </span>
                    <span className="mt-1.5 block pl-3">
                      <ProgressBar value={s.points} max={driverMax} color={getTeamColor(s.constructor_id)} />
                    </span>
                  </span>
                  <span className="tabular w-14 text-right text-sm font-semibold">{s.points}</span>
                </a>
              </li>
            ))}
          </ol>
        </Card>

        {/* Constructors' championship */}
        <Card
          className="lg:col-span-2"
          title="Constructors' championship"
          action={<ViewAll href={url("/standings?view=constructors")} />}
          bodyClassName=""
        >
          <ol className="divide-y divide-line">
            {teamStandings.map((s) => (
              <li key={s.standing_id}>
                <a
                  href={url(`/constructors?team=${s.constructor_id}`)}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-subtle sm:px-5"
                >
                  <PositionBadge position={s.position} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{teamName(s.constructor_id, s.constructor_name)}</span>
                    <span className="mt-1.5 block">
                      <ProgressBar value={s.points} max={teamMax} color={getTeamColor(s.constructor_id)} />
                    </span>
                  </span>
                  <span className="tabular w-12 text-right text-sm font-semibold">{s.points}</span>
                </a>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Every race winner */}
      <Card title="Race winners" action={<ViewAll href={url("/races")} label="Full calendar" />} bodyClassName="">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="label px-4 py-2.5 font-medium sm:px-5">Rd</th>
                <th className="label px-2 py-2.5 font-medium">Grand Prix</th>
                <th className="label px-2 py-2.5 font-medium">Date</th>
                <th className="label px-2 py-2.5 font-medium">Winner</th>
                <th className="label px-4 py-2.5 font-medium sm:px-5">Pole</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {races.map((race) => {
                const winner = winners.get(race.race_id)
                const pole = poles.get(race.race_id)
                return (
                  <tr key={race.race_id} className="transition-colors hover:bg-subtle">
                    <td className="tabular px-4 py-2.5 text-muted sm:px-5">{race.round}</td>
                    <td className="px-2 py-2.5">
                      <a href={url(`/races?round=${race.round}`)} className="font-medium hover:text-accent">
                        {race.race_name.replace(" Grand Prix", "")}
                      </a>
                    </td>
                    <td className="tabular whitespace-nowrap px-2 py-2.5 text-muted">{formatDate(race.date)}</td>
                    <td className="px-2 py-2.5">
                      {winner ? <DriverCell driverId={winner.driver_id} name={winner.driver_name} constructorId={winner.constructor_id} /> : "—"}
                    </td>
                    <td className="px-4 py-2.5 sm:px-5">
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

const ViewAll = ({ href, label = "View all" }) => (
  <a href={href} className="inline-flex items-center gap-0.5 text-sm font-medium text-muted hover:text-fg">
    {label}
    <Icon name="chevron" />
  </a>
)

const DriverCell = ({ driverId, name, constructorId }) => (
  <a href={url(`/drivers/${driverId}`)} className="inline-flex items-center gap-2 whitespace-nowrap hover:text-accent">
    <TeamBar constructorId={constructorId} />
    {name}
  </a>
)

export default Overview
