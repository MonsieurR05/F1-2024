// Season overview: a hero for the champion (or the visitor's team), key numbers,
// both championships and every race winner.
import { url } from "../utils/api.js"
import { useApi } from "../utils/useApi.js"
import { formatDate, getTeamColor, isClassified, teamName } from "../utils/f1Data.js"
import {
  DriverCutout, ErrorState, HERO_CUTOUT, HeroFrame, HeroStat, Icon, ProgressBar, SectionHeading, Skeleton, StatTile, TeamBar, TeamLogo,
  useSelectedTeam,
} from "./ui.jsx"

const openTeamPicker = () => document.getElementById("team-picker-open")?.click()
const cx = (...classes) => classes.filter(Boolean).join(" ")

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
      <div className="space-y-12" aria-busy="true">
        <Skeleton className="h-[26rem]" />
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}
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
    <div className="space-y-14 lg:space-y-20">
      {team ? (
        <TeamHero team={team} driverStandings={driverStandings} results={results} />
      ) : (
        <ChampionHero champion={driverChampion} poles={poleCounts[driverChampion?.driver_id] || 0} />
      )}

      {/* Key numbers: one row of figures, no boxes */}
      <div className="rise rise-2 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <StatTile
          label="Constructors' champion"
          value={teamName(teamChampion?.constructor_id, teamChampion?.constructor_name)}
          hint={`${teamChampion?.points} pts, ${teamChampion?.wins} wins`}
          dotColor={getTeamColor(teamChampion?.constructor_id)}
        />
        <StatTile label="Race winners" value={distinctWinners} hint={`Different drivers in ${races.length} rounds`} highlight />
        <StatTile
          label="Most poles"
          value={poleLeaderCount ?? "-"}
          hint={poleLeader?.driver_name}
          dotColor={poleLeader ? getTeamColor(poleLeader.constructor_id) : undefined}
        />
        <StatTile label="Grands Prix" value={races.length} hint={`${formatDate(races[0].date)} to ${formatDate(races[races.length - 1].date)}`} />
      </div>

      {/* Both championships side by side; the drivers' table gets more room */}
      <div className="rise rise-3 grid gap-14 lg:grid-cols-[1.45fr_1fr] lg:gap-12">
        <section>
          <SectionHeading title="Drivers' championship" action={<ViewAll href={url("/standings")} label="Full table" />} />
          <StandingsList
            rows={driverStandings.slice(0, 10).map((s) => ({
              key: s.standing_id,
              href: url(`/drivers/${s.driver_id}`),
              position: s.position,
              name: s.driver_name,
              sub: teamName(s.constructor_id, s.constructor_name),
              points: s.points,
              color: getTeamColor(s.constructor_id),
            }))}
            max={driverChampion.points}
          />
        </section>

        <section>
          <SectionHeading title="Constructors" action={<ViewAll href={url("/standings?view=constructors")} label="Full table" />} />
          <StandingsList
            rows={teamStandings.map((s) => ({
              key: s.standing_id,
              href: url(`/constructors?team=${s.constructor_id}`),
              position: s.position,
              name: teamName(s.constructor_id, s.constructor_name),
              logo: <TeamLogo constructorId={s.constructor_id} className="h-6 w-6" />,
              points: s.points,
              color: getTeamColor(s.constructor_id),
            }))}
            max={teamChampion.points}
          />
        </section>
      </div>

      {/* Every race winner */}
      <section className="rise rise-4">
        <SectionHeading title="Winners and pole sitters" action={<ViewAll href={url("/races")} label="Calendar" />} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-surface text-left">
                <th className="label py-3 pl-4 pr-2 font-medium">Rd</th>
                <th className="label px-2 py-3 font-medium">Grand Prix</th>
                <th className="label px-2 py-3 font-medium">Date</th>
                <th className="label px-2 py-3 font-medium">Winner</th>
                <th className="label py-3 pl-2 pr-4 font-medium">Pole</th>
              </tr>
            </thead>
            <tbody>
              {races.map((race) => {
                const winner = winners.get(race.race_id)
                const pole = poles.get(race.race_id)
                return (
                  <tr key={race.race_id} className="row-link even:bg-white/[0.02]">
                    <td className="tabular py-2.5 pl-4 pr-2 font-mono text-[13px] text-faint">{String(race.round).padStart(2, "0")}</td>
                    <td className="px-2 py-2.5">
                      <a href={url(`/races?round=${race.round}`)} className="font-semibold hover:text-team">
                        {race.race_name.replace(" Grand Prix", "")}
                      </a>
                    </td>
                    <td className="tabular whitespace-nowrap px-2 py-2.5 font-mono text-[13px] text-muted">{formatDate(race.date)}</td>
                    <td className="px-2 py-2.5">
                      {winner ? <DriverCell driverId={winner.driver_id} name={winner.driver_name} constructorId={winner.constructor_id} /> : "-"}
                    </td>
                    <td className="py-2.5 pl-2 pr-4">
                      {pole ? <DriverCell driverId={pole.driver_id} name={pole.driver_name} constructorId={pole.constructor_id} muted /> : "-"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Championship list: big position number, name, a thin points bar, points
// ---------------------------------------------------------------------------

const PODIUM = { 1: "text-gold", 2: "text-silver", 3: "text-bronze" }

const StandingsList = ({ rows, max }) => (
  <ol>
    {rows.map((row) => (
      <li key={row.key}>
        <a href={row.href} className="row-link group grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 py-2.5 pr-1">
          <span className={cx("display slant text-right text-2xl tabular", PODIUM[row.position] || "text-faint")}>
            {row.position}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              {row.logo}
              <span className="truncate font-semibold group-hover:text-team">{row.name}</span>
              {row.sub && <span className="hidden truncate text-[13px] text-faint sm:inline">{row.sub}</span>}
            </span>
            <span className="mt-1.5 block">
              <ProgressBar value={row.points} max={max} color={row.color} />
            </span>
          </span>
          <span className="tabular w-12 text-right font-mono text-sm font-medium">{row.points}</span>
        </a>
      </li>
    ))}
  </ol>
)

// ---------------------------------------------------------------------------
// Heroes
// ---------------------------------------------------------------------------

const ChampionHero = ({ champion, poles }) => {
  const [first, ...rest] = (champion?.driver_name || "").split(" ")
  return (
    <HeroFrame
      eyebrow="2024 World Champion"
      title={
        <>
          <span className="block text-4xl text-muted sm:text-5xl">{first}</span>
          <span className="slant block text-7xl sm:text-[7.5rem]">{rest.join(" ")}</span>
        </>
      }
      sub={`${teamName(champion?.constructor_id, champion?.constructor_name)}. Fourth title in a row.`}
      stats={
        <>
          <HeroStat label="Points" value={champion?.points} highlight />
          <HeroStat label="Wins" value={champion?.wins} />
          <HeroStat label="Poles" value={poles} />
        </>
      }
      actions={
        <>
          <a href={url("/standings")} className="btn-team">Standings</a>
          <button type="button" onClick={openTeamPicker} className="btn">Pick a team</button>
        </>
      }
      art={
        <DriverCutout
          driverId={champion?.driver_id}
          className={HERO_CUTOUT}
        />
      }
    />
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
    <HeroFrame
      eyebrow={`Your team. P${team.position} in the constructors'`}
      logo={<TeamLogo constructorId={team.constructor_id} className="h-12 w-12" />}
      title={<span className="slant block text-7xl sm:text-[7.5rem]">{teamName(team.constructor_id, team.constructor_name)}</span>}
      sub={names.join(" and ")}
      stats={
        <>
          <HeroStat label="Points" value={team.points} highlight />
          <HeroStat label="Wins" value={team.wins} />
          <HeroStat label="Podiums" value={podiums} />
        </>
      }
      actions={
        <>
          <a href={url(`/constructors?team=${team.constructor_id}`)} className="btn-team">Team page</a>
          <button type="button" onClick={openTeamPicker} className="btn">Change team</button>
        </>
      }
      art={
        <div className="absolute bottom-0 right-0 flex h-[70%] items-end opacity-40 lg:h-[100%] lg:opacity-100">
          {lineup.map((id, i) => (
            <DriverCutout key={id} driverId={id} className={`h-full w-auto ${i === 1 ? "-ml-24 hidden scale-90 lg:block" : ""}`} />
          ))}
        </div>
      }
    />
  )
}

const ViewAll = ({ href, label }) => (
  <a href={href} className="inline-flex items-center gap-0.5 pb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted hover:text-team">
    {label}
    <Icon name="chevron" />
  </a>
)

const DriverCell = ({ driverId, name, constructorId, muted }) => (
  <a href={url(`/drivers/${driverId}`)} className={cx("inline-flex items-center gap-2 whitespace-nowrap hover:text-team", muted && "text-muted")}>
    <TeamBar constructorId={constructorId} className="h-3.5" />
    {name}
  </a>
)

export default Overview
