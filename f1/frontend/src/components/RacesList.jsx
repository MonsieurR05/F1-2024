// Races: the full calendar, and a detail view for one round (?round=<n>).
import { useEffect, useMemo, useState } from "react"
import { url } from "../utils/api.js"
import { useApi } from "../utils/useApi.js"
import { finishLabel, formatDate, getCircuit, teamName } from "../utils/f1Data.js"
import {
  BackLink, Card, DriverCutout, EmptyState, ErrorState, Icon, LoadingRows, PageHeader, PositionBadge,
  SearchInput, Skeleton, StatTile, Tabs, TeamBar,
} from "./ui.jsx"

const readRoundFromUrl = () => {
  const round = Number(new URLSearchParams(window.location.search).get("round"))
  return Number.isInteger(round) && round > 0 ? round : null
}

const RacesList = () => {
  const [round, setRound] = useState(null)
  const { data, error, loading, retry } = useApi(["/api/races", "/api/results"])

  // Keep the selected round in the URL so race pages can be linked and the back button works
  useEffect(() => {
    setRound(readRoundFromUrl())
    const onPopState = () => setRound(readRoundFromUrl())
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const openRound = (next) => {
    const params = new URLSearchParams(window.location.search)
    if (next) params.set("round", next)
    else params.delete("round")
    const query = params.toString()
    window.history.pushState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`)
    setRound(next)
    window.scrollTo({ top: 0 })
  }

  const header = <PageHeader title="Race calendar" subtitle="All 24 rounds of the 2024 season, with results and qualifying" />
  if (error) return <>{header}<ErrorState onRetry={retry} /></>
  if (loading || !data) return round ? <DetailSkeleton /> : <>{header}<LoadingRows count={12} /></>

  const [races, results] = data
  const race = round ? races.find((r) => r.round === round) : null

  if (round && !race) {
    return (
      <div className="space-y-4">
        <BackLink onClick={() => openRound(null)}>Race calendar</BackLink>
        <EmptyState title="Race not found">There's no round {round} in the 2024 calendar.</EmptyState>
      </div>
    )
  }
  return race ? (
    <RaceDetail race={race} onBack={() => openRound(null)} />
  ) : (
    <>
      {header}
      <Calendar races={races} results={results} onOpen={openRound} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

const Calendar = ({ races, results, onOpen }) => {
  const [search, setSearch] = useState("")
  const winners = useMemo(() => new Map(results.filter((r) => r.position === 1).map((r) => [r.race_id, r])), [results])

  const term = search.trim().toLowerCase()
  const visible = races.filter(
    (race) =>
      !term ||
      [race.race_name, race.circuit_name, race.locality, race.country, winners.get(race.race_id)?.driver_name]
        .some((field) => field?.toLowerCase().includes(term)),
  )

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Search races, circuits, winners" label="Search races" />

      {visible.length === 0 ? (
        <EmptyState title="No races found">
          Nothing matches "{search}".{" "}
          <button type="button" className="font-medium text-team hover:underline" onClick={() => setSearch("")}>Clear search</button>
        </EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="label px-4 py-3 font-medium sm:px-5">Rd</th>
                <th className="label px-2 py-3 font-medium">Grand Prix</th>
                <th className="label px-2 py-3 font-medium">Date</th>
                <th className="label px-2 py-3 font-medium">Winner</th>
                <th className="w-10 px-4 sm:px-5"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((race) => {
                const winner = winners.get(race.race_id)
                return (
                  <tr key={race.race_id} className="group cursor-pointer transition-colors hover:bg-subtle" onClick={() => onOpen(race.round)}>
                    <td className="tabular px-4 py-3 text-muted sm:px-5">{race.round}</td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onOpen(race.round) }}
                        className="text-left font-medium group-hover:text-team"
                      >
                        {race.race_name}
                      </button>
                      <span className="block text-xs text-muted">{race.circuit_name} · {race.locality}, {race.country}</span>
                    </td>
                    <td className="tabular whitespace-nowrap px-2 py-3 text-muted">{formatDate(race.date)}</td>
                    <td className="px-2 py-3">
                      {winner ? (
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <TeamBar constructorId={winner.constructor_id} />
                          {winner.driver_name}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-faint sm:px-5"><Icon name="chevron" /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// One race
// ---------------------------------------------------------------------------

const RaceDetail = ({ race, onBack }) => {
  const [tab, setTab] = useState("race")
  const { data, error, loading, retry } = useApi([
    `/api/races/${race.race_id}/results`,
    `/api/races/${race.race_id}/qualifying`,
  ])
  const circuit = getCircuit(race.circuit_id)
  const [mapFailed, setMapFailed] = useState(false)

  const [results = [], qualifying = []] = data || []
  const winner = results.find((r) => r.position === 1)
  const fastest = results.find((r) => r.rank === 1)
  const laps = winner?.laps

  return (
    <div className="space-y-6">
      <BackLink onClick={onBack}>Race calendar</BackLink>

      {/* Hero */}
      <section className="hero rise min-h-[20rem]">
        <span className="pointer-events-none absolute -right-2 -top-10 select-none font-display text-[11rem] font-black leading-none text-white/[0.04] sm:text-[16rem]" aria-hidden="true">
          {String(race.round).padStart(2, "0")}
        </span>
        <div className="relative z-10 flex max-w-[32rem] flex-col p-6 sm:p-10">
          <p className="label text-team">Round {race.round} · {formatDate(race.date, "full")}</p>
          <h1 className="mt-3 font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
            {race.race_name.replace(" Grand Prix", "")}
            <span className="block text-2xl text-muted sm:text-3xl">Grand Prix</span>
          </h1>
          <p className="mt-3 text-sm text-muted">{race.circuit_name} · {race.locality}, {race.country}</p>
          {winner && (
            <div className="mt-8">
              <p className="label">Winner</p>
              <a href={url(`/drivers/${winner.driver_id}`)} className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight hover:text-team sm:text-3xl">
                <TeamBar constructorId={winner.constructor_id} className="h-6" />
                {winner.driver_name}
              </a>
              <p className="mt-1 text-sm text-muted">{teamName(winner.constructor_id, winner.constructor_name)} · {winner.time}</p>
            </div>
          )}
        </div>
        {winner && (
          <DriverCutout
            driverId={winner.driver_id}
            className="absolute -right-8 bottom-0 h-[62%] w-auto opacity-30 sm:right-4 sm:h-[100%] sm:opacity-100"
          />
        )}
      </section>

      {/* Circuit */}
      <div className="rise rise-2 grid gap-6 lg:grid-cols-5">
        <Card title="Circuit" className="lg:col-span-3">
          {circuit?.map && !mapFailed ? (
            <div className="p-1">
              {/* The maps are drawn on white; inverting and screening them puts the track on the dark card */}
              <img
                src={circuit.map}
                alt={`${race.circuit_name} layout`}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="mx-auto max-h-72 w-full object-contain mix-blend-screen invert hue-rotate-180"
                onError={() => setMapFailed(true)}
              />
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted">Circuit map unavailable</p>
          )}
        </Card>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-2">
          <StatTile label="Circuit length" value={circuit ? `${circuit.lengthKm.toFixed(3)} km` : "—"} />
          <StatTile label="Laps" value={laps ?? "—"} />
          <StatTile
            label="Race distance"
            value={circuit && laps ? `${(circuit.lengthKm * laps).toFixed(1)} km` : "—"}
          />
          <StatTile label="First Grand Prix" value={circuit?.firstGrandPrix ?? "—"} />
          <div className="col-span-2">
            <StatTile
              label="Lap record"
              value={circuit?.lapRecord.time ?? "—"}
              hint={circuit ? `${circuit.lapRecord.driver}, ${circuit.lapRecord.year}` : undefined}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            label="Session"
            active={tab}
            onChange={setTab}
            tabs={[{ id: "race", label: "Race" }, { id: "qualifying", label: "Qualifying" }]}
          />
          {tab === "race" && fastest && (
            <p className="text-sm text-muted">
              Fastest lap: <span className="font-medium text-fg">{fastest.driver_name}</span>{" "}
              <span className="tabular">{fastest.fastest_lap_time}</span>
            </p>
          )}
        </div>

        {error ? (
          <ErrorState onRetry={retry} />
        ) : loading || !data ? (
          <LoadingRows count={10} />
        ) : tab === "race" ? (
          <RaceTable results={results} fastestId={fastest?.result_id} />
        ) : (
          <QualifyingTable qualifying={qualifying} />
        )}
      </div>
    </div>
  )
}

const DriverName = ({ driverId, name, constructorId }) => (
  <a href={url(`/drivers/${driverId}`)} className="inline-flex items-center gap-2 whitespace-nowrap font-medium hover:text-team">
    <TeamBar constructorId={constructorId} />
    {name}
  </a>
)

const RaceTable = ({ results, fastestId }) => (
  <div className="card overflow-x-auto">
    <table className="w-full min-w-[680px] text-sm">
      <thead>
        <tr className="border-b border-line text-left">
          <th className="label px-4 py-3 font-medium sm:px-5">Pos</th>
          <th className="label px-2 py-3 font-medium">Driver</th>
          <th className="label px-2 py-3 font-medium">Team</th>
          <th className="label px-2 py-3 text-right font-medium">Grid</th>
          <th className="label px-2 py-3 text-right font-medium">Laps</th>
          <th className="label px-2 py-3 font-medium">Time / status</th>
          <th className="label px-4 py-3 text-right font-medium sm:px-5">Pts</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {results.map((r) => (
          <tr key={r.result_id} className="transition-colors hover:bg-subtle">
            <td className="px-4 py-2.5 sm:px-5"><PositionBadge label={finishLabel(r)} /></td>
            <td className="px-2 py-2.5">
              <DriverName driverId={r.driver_id} name={r.driver_name} constructorId={r.constructor_id} />
              {r.result_id === fastestId && (
                <span className="ml-2 rounded bg-subtle px-1.5 py-0.5 text-[11px] font-medium text-muted">Fastest lap</span>
              )}
            </td>
            <td className="px-2 py-2.5 text-muted">{teamName(r.constructor_id, r.constructor_name)}</td>
            <td className="tabular px-2 py-2.5 text-right text-muted">{r.grid || "Pit lane"}</td>
            <td className="tabular px-2 py-2.5 text-right text-muted">{r.laps}</td>
            <td className="tabular px-2 py-2.5 text-muted">{r.time || r.status}</td>
            <td className="tabular px-4 py-2.5 text-right font-semibold sm:px-5">{r.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const QualifyingTable = ({ qualifying }) => {
  if (qualifying.length === 0) return <EmptyState title="No qualifying data for this round" />
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="label px-4 py-3 font-medium sm:px-5">Pos</th>
            <th className="label px-2 py-3 font-medium">Driver</th>
            <th className="label px-2 py-3 font-medium">Team</th>
            <th className="label px-2 py-3 text-right font-medium">Q1</th>
            <th className="label px-2 py-3 text-right font-medium">Q2</th>
            <th className="label px-4 py-3 text-right font-medium sm:px-5">Q3</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {qualifying.map((q) => (
            <tr key={q.qualifying_id} className="transition-colors hover:bg-subtle">
              <td className="px-4 py-2.5 sm:px-5"><PositionBadge position={q.position} /></td>
              <td className="px-2 py-2.5"><DriverName driverId={q.driver_id} name={q.driver_name} constructorId={q.constructor_id} /></td>
              <td className="px-2 py-2.5 text-muted">{teamName(q.constructor_id, q.constructor_name)}</td>
              <td className="tabular px-2 py-2.5 text-right text-muted">{q.q1 || "—"}</td>
              <td className="tabular px-2 py-2.5 text-right text-muted">{q.q2 || "—"}</td>
              <td className="tabular px-4 py-2.5 text-right font-medium sm:px-5">{q.q3 || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const DetailSkeleton = () => (
  <div className="space-y-6" aria-busy="true">
    <Skeleton className="h-5 w-32" />
    <Skeleton className="h-28" />
    <Skeleton className="h-72" />
    <Skeleton className="h-96" />
  </div>
)

export default RacesList
