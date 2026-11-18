// Grid of every 2024 driver with search and sorting.
import { useMemo, useState } from "react"
import { url } from "../utils/api.js"
import { useApi } from "../utils/useApi.js"
import { getTeamColor, teamName } from "../utils/f1Data.js"
import { DriverAvatar, EmptyState, ErrorState, LoadingCards, SearchInput } from "./ui.jsx"

const SORTS = {
  championship: { label: "Championship", compare: (a, b) => (a.standing?.position ?? 99) - (b.standing?.position ?? 99) },
  name: { label: "Name", compare: (a, b) => a.family_name.localeCompare(b.family_name) },
  number: { label: "Car number", compare: (a, b) => (a.permanent_number ?? 999) - (b.permanent_number ?? 999) },
}

const DriversList = () => {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("championship")
  const { data, error, loading, retry } = useApi(["/api/drivers", "/api/standings/drivers"])

  const drivers = useMemo(() => {
    if (!data) return []
    const [allDrivers, standings] = data
    const byDriver = new Map(standings.map((s) => [s.driver_id, s]))
    return allDrivers.map((d) => ({ ...d, standing: byDriver.get(d.driver_id) }))
  }, [data])

  if (error) return <ErrorState onRetry={retry} />

  const term = search.trim().toLowerCase()
  const visible = drivers
    .filter((d) =>
      !term ||
      [d.full_name, d.nationality, d.code, d.standing?.constructor_name]
        .some((field) => field?.toLowerCase().includes(term)),
    )
    .sort(SORTS[sort].compare)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search drivers, teams, nationality" label="Search drivers" />
        <label className="flex items-center gap-2 text-sm text-muted">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="field cursor-pointer bg-surface pr-8 [&>option]:bg-surface"
          >
            {Object.entries(SORTS).map(([id, option]) => (
              <option key={id} value={id}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading || !data ? (
        <LoadingCards count={9} className="h-[104px]" />
      ) : visible.length === 0 ? (
        <EmptyState title="No drivers found">
          Nothing matches "{search}".{" "}
          <button type="button" className="font-medium text-team hover:underline" onClick={() => setSearch("")}>Clear search</button>
        </EmptyState>
      ) : (
        <>
          <p className="font-mono text-[13px] text-muted">{visible.length} of {drivers.length} drivers</p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((driver) => (
              <li key={driver.driver_id}>
                <DriverCard driver={driver} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

const DriverCard = ({ driver }) => {
  const { standing } = driver
  const color = standing ? getTeamColor(standing.constructor_id) : "#6B7280"
  return (
    <a
      href={url(`/drivers/${driver.driver_id}`)}
      // Each card carries the driver's team colour on its left edge
      style={{ "--team": color, boxShadow: `inset 3px 0 0 ${color}` }}
      className="card card-link group flex h-full items-center gap-4 overflow-hidden p-4 pl-5"
    >
      <DriverAvatar driverId={driver.driver_id} name={driver.full_name} constructorId={standing?.constructor_id} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold group-hover:text-team">{driver.full_name}</p>
        <p className="truncate text-[13px] text-muted">
          {standing ? teamName(standing.constructor_id, standing.constructor_name) : "No race starts"}
        </p>
        <p className="mt-2.5 flex gap-4 font-mono text-[13px] text-muted">
          <span><span className="text-fg">{standing ? `P${standing.position}` : "-"}</span></span>
          <span><span className="text-fg">{standing?.points ?? 0}</span> pts</span>
          <span>{driver.code}</span>
        </p>
      </div>
      <span className="display slant shrink-0 text-5xl text-team" aria-label={`Car number ${driver.permanent_number ?? "none"}`}>
        {driver.permanent_number ?? "-"}
      </span>
    </a>
  )
}

export default DriversList
