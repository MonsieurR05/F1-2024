// Grid of every 2024 driver with search and sorting.
import { useMemo, useState } from "react"
import { url } from "../utils/api.js"
import { useApi } from "../utils/useApi.js"
import { teamName } from "../utils/f1Data.js"
import { DriverAvatar, EmptyState, ErrorState, LoadingCards, SearchInput, TeamBar } from "./ui.jsx"

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
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
          >
            {Object.entries(SORTS).map(([id, option]) => (
              <option key={id} value={id}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading || !data ? (
        <LoadingCards count={9} className="h-[132px]" />
      ) : visible.length === 0 ? (
        <EmptyState title="No drivers found">
          Nothing matches "{search}".{" "}
          <button type="button" className="font-medium text-accent hover:underline" onClick={() => setSearch("")}>Clear search</button>
        </EmptyState>
      ) : (
        <>
          <p className="text-sm text-muted">{visible.length} of {drivers.length} drivers</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  return (
    <a
      href={url(`/drivers/${driver.driver_id}`)}
      className="card group flex h-full items-center gap-4 p-4 transition-shadow hover:shadow-pop"
    >
      <DriverAvatar driverId={driver.driver_id} name={driver.full_name} constructorId={standing?.constructor_id} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-semibold group-hover:text-accent">{driver.full_name}</p>
          <span className="tabular shrink-0 text-sm font-semibold text-muted">#{driver.permanent_number ?? "—"}</span>
        </div>
        <p className="mt-0.5 flex items-center gap-2 truncate text-sm text-muted">
          {standing ? (
            <>
              <TeamBar constructorId={standing.constructor_id} className="h-3.5" />
              {teamName(standing.constructor_id, standing.constructor_name)}
            </>
          ) : (
            "No race starts"
          )}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span>
            <span className="text-muted">Pos </span>
            <span className="tabular font-semibold">{standing ? `P${standing.position}` : "—"}</span>
          </span>
          <span>
            <span className="text-muted">Pts </span>
            <span className="tabular font-semibold">{standing?.points ?? 0}</span>
          </span>
          <span className="ml-auto text-xs font-medium text-faint">{driver.code}</span>
        </div>
      </div>
    </a>
  )
}

export default DriversList
