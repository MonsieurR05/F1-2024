// Shared UI building blocks used by every page.
import { useEffect, useState } from "react"
import { getDriverCutoutUrls, getDriverImageUrls, getTeamColor, initials, teamCode } from "../utils/f1Data.js"
import { applyTheme, getSelectedTeam, TEAM_CHANGE_EVENT } from "../utils/theme.js"

const cx = (...classes) => classes.filter(Boolean).join(" ")

// ---------------------------------------------------------------------------
// Theme hooks
// ---------------------------------------------------------------------------

// The team the visitor picked in the team picker ("" for none), kept up to date
export const useSelectedTeam = () => {
  const [team, setTeam] = useState("")
  useEffect(() => {
    setTeam(getSelectedTeam())
    const onChange = (e) => setTeam(e.detail || "")
    window.addEventListener(TEAM_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(TEAM_CHANGE_EVENT, onChange)
  }, [])
  return team
}

// Theme the whole page in a team's colours while a component is shown
// (a team or driver page), then return to the visitor's own choice.
export const useTeamTheme = (teamId) => {
  useEffect(() => {
    if (!teamId) return undefined
    applyTheme(teamId)
    const restore = () => applyTheme(getSelectedTeam())
    // If the visitor picks a team while here, their pick takes over
    window.addEventListener(TEAM_CHANGE_EVENT, restore)
    return () => {
      window.removeEventListener(TEAM_CHANGE_EVENT, restore)
      restore()
    }
  }, [teamId])
}

// ---------------------------------------------------------------------------
// Icons (24x24 outline paths)
// ---------------------------------------------------------------------------

const ICONS = {
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  back: "M15 18l-6-6 6-6",
  chevron: "M9 18l6-6-6-6",
  x: "M6 6l12 12M18 6L6 18",
  alert: "M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  refresh: "M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6",
}

export const Icon = ({ name, className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICONS[name]} />
  </svg>
)

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export const PageHeader = ({ title, subtitle, eyebrow = "2024 season" }) => (
  <div className="rise mb-8 lg:mb-10">
    <p className="label text-team">{eyebrow}</p>
    <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
    {subtitle && <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">{subtitle}</p>}
  </div>
)

export const Card = ({ title, action, children, className, bodyClassName, as: Tag = "section" }) => (
  <Tag className={cx("card", className)}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-5 sm:px-6">
        {title && <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>}
        {action}
      </div>
    )}
    <div className={bodyClassName ?? "p-5 sm:p-6"}>{children}</div>
  </Tag>
)

// Compact figure card. `highlight` paints the value in the team colour.
export const StatTile = ({ label, value, hint, highlight, dotColor }) => (
  <div className="card p-5">
    <p className="label flex items-center gap-2">
      {dotColor && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 10px ${dotColor}` }} />}
      {label}
    </p>
    <p className={cx("mt-3 font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl", highlight && "text-team")}>
      {value}
    </p>
    {hint && <p className="mt-2 truncate text-sm text-muted">{hint}</p>}
  </div>
)

export const BackLink = ({ onClick, href, children }) => {
  const className = "pill inline-flex items-center gap-1.5 py-2 pl-3 pr-4 text-sm font-medium text-muted transition-colors hover:text-fg"
  const content = (
    <>
      <Icon name="back" />
      {children}
    </>
  )
  return href ? (
    <a href={href} className={className}>{content}</a>
  ) : (
    <button type="button" onClick={onClick} className={className}>{content}</button>
  )
}

export const Tabs = ({ tabs, active, onChange, label }) => (
  <div role="tablist" aria-label={label} className="pill inline-flex p-1">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={active === tab.id}
        onClick={() => onChange(tab.id)}
        className={cx(
          "rounded-full px-4 py-2 text-sm font-semibold transition-all",
          active === tab.id ? "bg-team text-on-team shadow-[0_8px_24px_-8px_var(--team)]" : "text-muted hover:text-fg",
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
)

export const SearchInput = ({ value, onChange, placeholder, label = "Search" }) => (
  <div className="relative w-full sm:max-w-sm">
    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-faint">
      <Icon name="search" />
    </span>
    <input
      type="search"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="field w-full pl-10"
    />
  </div>
)

// ---------------------------------------------------------------------------
// Racing elements
// ---------------------------------------------------------------------------

// Small coloured bar used next to drivers and teams
export const TeamBar = ({ constructorId, className = "h-4" }) => (
  <span
    className={cx("inline-block w-1 shrink-0 rounded-full", className)}
    style={{ backgroundColor: getTeamColor(constructorId) }}
    aria-hidden="true"
  />
)

// Rounded team badge with the team's three-letter code ("McLaren" -> "MCL")
export const TeamBadge = ({ constructorId, name, size = "md" }) => {
  const color = getTeamColor(constructorId)
  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center rounded-2xl font-display font-extrabold tracking-wide",
        size === "lg" ? "h-16 w-16 text-base" : "h-11 w-11 text-[11px]",
      )}
      style={{
        background: `linear-gradient(145deg, ${color}38, ${color}10)`,
        color,
        boxShadow: `inset 0 0 0 1px ${color}40, 0 10px 30px -12px ${color}`,
      }}
      aria-hidden="true"
    >
      {teamCode(constructorId, name)}
    </span>
  )
}

// Loads a driver's photo, trying each known URL; src is null once all have failed
const useDriverImage = (driverId, { cutout = false } = {}) => {
  const urls = cutout ? getDriverCutoutUrls(driverId) : getDriverImageUrls(driverId)
  const [index, setIndex] = useState(0)
  const next = () => setIndex((i) => i + 1)
  return {
    src: index < urls.length ? urls[index] : null,
    onError: next,
    // Some hosts answer hotlinked requests with a 1x1 placeholder instead of an error
    onLoad: (e) => e.currentTarget.naturalWidth < 10 && next(),
  }
}

// Round driver photo that falls back to initials
export const DriverAvatar = ({ driverId, name, constructorId, size = "md" }) => {
  const image = useDriverImage(driverId)
  const color = constructorId ? getTeamColor(constructorId) : "#9CA3AF"
  const sizes = { sm: "h-9 w-9 text-xs", md: "h-14 w-14 text-sm", lg: "h-24 w-24 text-2xl" }

  return (
    <span
      className={cx("relative grid shrink-0 place-items-center overflow-hidden rounded-full font-display font-bold text-muted", sizes[size])}
      style={{ background: `radial-gradient(circle at 50% 30%, ${color}55, ${color}12 70%)`, boxShadow: `inset 0 0 0 1.5px ${color}90` }}
    >
      {image.src ? (
        <img
          src={image.src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-top"
          onError={image.onError}
          onLoad={image.onLoad}
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  )
}

// Large transparent driver image for hero panels; renders nothing if no image loads
export const DriverCutout = ({ driverId, className }) => {
  const image = useDriverImage(driverId, { cutout: true })
  if (!image.src) return null
  return (
    <img
      src={image.src}
      alt=""
      referrerPolicy="no-referrer"
      className={cx("cutout pointer-events-none select-none object-contain object-bottom", className)}
      onError={image.onError}
      onLoad={image.onLoad}
    />
  )
}

// Finishing position chip, with gold / silver / bronze for the podium
export const PositionBadge = ({ position, label }) => {
  const text = label ?? position
  const podium = {
    1: "bg-gold/15 text-gold ring-1 ring-gold/30",
    2: "bg-silver/15 text-silver ring-1 ring-silver/25",
    3: "bg-bronze/15 text-bronze ring-1 ring-bronze/25",
  }
  const style = /^\d+$/.test(String(text)) ? podium[Number(text)] || "bg-subtle text-fg" : "bg-danger/15 text-danger"
  return (
    <span className={cx("tabular inline-grid h-8 min-w-[2rem] place-items-center rounded-xl px-1.5 font-display text-xs font-bold", style)}>
      {text}
    </span>
  )
}

// Horizontal bar showing a value relative to a maximum
export const ProgressBar = ({ value, max, color }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
    <div
      className="h-full rounded-full transition-[width] duration-700"
      style={{
        width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%`,
        background: `linear-gradient(90deg, ${color}99, ${color})`,
        boxShadow: `0 0 12px -2px ${color}`,
      }}
    />
  </div>
)

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const Skeleton = ({ className }) => <div className={cx("animate-pulse rounded-[1.75rem] bg-subtle", className)} />

export const LoadingCards = ({ count = 6, className = "h-28" }) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className={className} />
    ))}
  </div>
)

export const LoadingRows = ({ count = 8 }) => (
  <div className="card divide-y divide-line" aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-4 flex-1 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
    ))}
  </div>
)

export const ErrorState = ({ onRetry, message }) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center">
    <span className="grid h-12 w-12 place-items-center rounded-full bg-danger/15 text-danger">
      <Icon name="alert" className="h-5 w-5" />
    </span>
    <h2 className="mt-4 font-display text-xl font-bold">Couldn't load the data</h2>
    <p className="mt-1 max-w-sm text-sm text-muted">
      {message || "The data source didn't respond. If you're running locally, check that the Flask API is running."}
    </p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-team mt-6">
        <Icon name="refresh" />
        Try again
      </button>
    )}
  </div>
)

export const EmptyState = ({ title, children }) => (
  <div className="card px-6 py-14 text-center">
    <h2 className="font-display text-xl font-bold">{title}</h2>
    {children && <div className="mt-1 text-sm text-muted">{children}</div>}
  </div>
)
