// Full drivers' and constructors' championship tables.
import { useEffect, useState } from "react"
import { url } from "../utils/api.js"
import { useApi } from "../utils/useApi.js"
import { getTeamColor, teamName } from "../utils/f1Data.js"
import { ErrorState, LoadingRows, PositionBadge, ProgressBar, Tabs, TeamBar, TeamBadge } from "./ui.jsx"

const TABS = [
  { id: "drivers", label: "Drivers" },
  { id: "constructors", label: "Constructors" },
]

const StandingsView = () => {
  const [view, setView] = useState("drivers")
  const { data, error, loading, retry } = useApi(["/api/standings/drivers", "/api/standings/constructors"])

  // Open the tab named in the URL (?view=constructors) and keep the URL in sync
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("view")
    if (requested === "constructors") setView("constructors")
  }, [])

  const changeView = (next) => {
    setView(next)
    const params = new URLSearchParams(window.location.search)
    if (next === "drivers") params.delete("view")
    else params.set("view", next)
    const query = params.toString()
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`)
  }

  return (
    <div className="space-y-4">
      <Tabs tabs={TABS} active={view} onChange={changeView} label="Championship" />
      {error ? (
        <ErrorState onRetry={retry} />
      ) : loading || !data ? (
        <LoadingRows count={10} />
      ) : view === "drivers" ? (
        <DriverTable standings={data[0]} />
      ) : (
        <ConstructorTable standings={data[1]} />
      )}
    </div>
  )
}

const HeaderCell = ({ children, className = "" }) => (
  <th className={`label px-2 py-3 font-medium ${className}`}>{children}</th>
)

const DriverTable = ({ standings }) => {
  const leader = standings[0]?.points || 0
  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left">
            <HeaderCell className="w-14 pl-4 sm:pl-5">Pos</HeaderCell>
            <HeaderCell>Driver</HeaderCell>
            <HeaderCell>Team</HeaderCell>
            <HeaderCell className="text-right">Wins</HeaderCell>
            <HeaderCell className="w-40 pl-6">Points</HeaderCell>
            <HeaderCell className="pr-4 text-right sm:pr-5">Gap</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.standing_id}>
              <td className="py-3 pl-4 pr-2 sm:pl-5"><PositionBadge position={s.position} /></td>
              <td className="px-2 py-3">
                <a href={url(`/drivers/${s.driver_id}`)} className="inline-flex items-center gap-2 font-medium hover:text-team">
                  <TeamBar constructorId={s.constructor_id} />
                  {s.driver_name}
                </a>
              </td>
              <td className="px-2 py-3">
                <a href={url(`/constructors?team=${s.constructor_id}`)} className="text-muted hover:text-fg">
                  {teamName(s.constructor_id, s.constructor_name)}
                </a>
              </td>
              <td className="tabular px-2 py-3 text-right">{s.wins}</td>
              <td className="py-3 pl-6 pr-2">
                <div className="flex items-center gap-3">
                  <span className="tabular w-10 text-right font-mono">{s.points}</span>
                  <span className="flex-1"><ProgressBar value={s.points} max={leader} color={getTeamColor(s.constructor_id)} /></span>
                </div>
              </td>
              <td className="tabular py-3 pl-2 pr-4 text-right font-mono text-[13px] text-muted sm:pr-5">
                {s.position === 1 ? "Leader" : `−${leader - s.points}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ConstructorTable = ({ standings }) => {
  const leader = standings[0]?.points || 0
  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-left">
            <HeaderCell className="w-14 pl-4 sm:pl-5">Pos</HeaderCell>
            <HeaderCell>Team</HeaderCell>
            <HeaderCell className="text-right">Wins</HeaderCell>
            <HeaderCell className="w-48 pl-6">Points</HeaderCell>
            <HeaderCell className="pr-4 text-right sm:pr-5">Gap</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.standing_id}>
              <td className="py-3 pl-4 pr-2 sm:pl-5"><PositionBadge position={s.position} /></td>
              <td className="px-2 py-3">
                <a href={url(`/constructors?team=${s.constructor_id}`)} className="inline-flex items-center gap-3 font-medium hover:text-team">
                  <TeamBadge constructorId={s.constructor_id} name={s.constructor_name} />
                  {teamName(s.constructor_id, s.constructor_name)}
                </a>
              </td>
              <td className="tabular px-2 py-3 text-right">{s.wins}</td>
              <td className="py-3 pl-6 pr-2">
                <div className="flex items-center gap-3">
                  <span className="tabular w-10 text-right font-mono">{s.points}</span>
                  <span className="flex-1"><ProgressBar value={s.points} max={leader} color={getTeamColor(s.constructor_id)} /></span>
                </div>
              </td>
              <td className="tabular py-3 pl-2 pr-4 text-right font-mono text-[13px] text-muted sm:pr-5">
                {s.position === 1 ? "Leader" : `−${leader - s.points}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StandingsView
