// Shared UI building blocks used by every page.
import { useState } from "react"
import { getDriverImageUrls, getTeamColor, initials, teamCode } from "../utils/f1Data.js"

const cx = (...classes) => classes.filter(Boolean).join(" ")

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
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={ICONS[name]} />
  </svg>
)

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export const Card = ({ title, action, children, className, bodyClassName, as: Tag = "section" }) => (
  <Tag className={cx("card", className)}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        {title && <h2 className="text-sm font-semibold">{title}</h2>}
        {action}
      </div>
    )}
    <div className={bodyClassName ?? "p-4 sm:p-5"}>{children}</div>
  </Tag>
)

export const PageHeader = ({ title, subtitle }) => (
  <div className="mb-6 lg:mb-8">
    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
    {subtitle && <p className="mt-1 text-sm text-muted sm:text-base">{subtitle}</p>}
  </div>
)

export const StatTile = ({ label, value, hint, accentColor }) => (
  <div className="card relative overflow-hidden p-4 sm:p-5">
    {accentColor && <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accentColor }} />}
    <p className="label">{label}</p>
    <p className="tabular mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    {hint && <p className="mt-1 truncate text-sm text-muted">{hint}</p>}
  </div>
)

export const BackLink = ({ onClick, href, children }) => {
  const className = "inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg"
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
  <div role="tablist" aria-label={label} className="inline-flex rounded-lg border border-line bg-subtle p-1">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={active === tab.id}
        onClick={() => onChange(tab.id)}
        className={cx(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          active === tab.id ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg",
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
)

export const SearchInput = ({ value, onChange, placeholder, label = "Search" }) => (
  <div className="relative w-full sm:max-w-xs">
    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-faint">
      <Icon name="search" />
    </span>
    <input
      type="search"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
    />
  </div>
)

// ---------------------------------------------------------------------------
// Racing elements
// ---------------------------------------------------------------------------

// Small colored bar used next to drivers and teams
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
  const label = teamCode(constructorId, name)
  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center rounded-lg font-semibold",
        size === "lg" ? "h-14 w-14 text-sm" : "h-10 w-10 text-[11px]",
      )}
      style={{ backgroundColor: `${color}22`, color, boxShadow: `inset 0 0 0 1px ${color}55` }}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}

// Driver photo that falls back to initials when no image loads
export const DriverAvatar = ({ driverId, name, constructorId, size = "md" }) => {
  const urls = getDriverImageUrls(driverId)
  const [index, setIndex] = useState(0)
  const color = constructorId ? getTeamColor(constructorId) : "#9CA3AF"
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-12 w-12 text-sm", lg: "h-20 w-20 text-xl sm:h-24 sm:w-24" }

  return (
    <span
      className={cx("relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-subtle font-semibold text-muted", sizes[size])}
      style={{ boxShadow: `0 0 0 2px ${color}` }}
    >
      {index < urls.length ? (
        <img
          src={urls[index]}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-top"
          onError={() => setIndex((i) => i + 1)}
          // Some hosts answer hotlinked requests with a 1x1 placeholder instead of an error
          onLoad={(e) => e.currentTarget.naturalWidth < 10 && setIndex((i) => i + 1)}
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  )
}

// Finishing position chip, with gold / silver / bronze for the podium
export const PositionBadge = ({ position, label }) => {
  const text = label ?? position
  const podium = { 1: "bg-gold/15 text-gold", 2: "bg-silver/15 text-silver", 3: "bg-bronze/15 text-bronze" }
  const style = /^\d+$/.test(String(text))
    ? podium[Number(text)] || "bg-subtle text-fg"
    : "bg-accent-soft text-accent"
  return (
    <span className={cx("tabular inline-grid h-7 min-w-[1.75rem] place-items-center rounded-md px-1.5 text-xs font-semibold", style)}>
      {text}
    </span>
  )
}

// Horizontal bar showing a value relative to a maximum
export const ProgressBar = ({ value, max, color }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
    <div
      className="h-full rounded-full"
      style={{ width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%`, backgroundColor: color }}
    />
  </div>
)

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const Skeleton = ({ className }) => <div className={cx("animate-pulse rounded-md bg-subtle", className)} />

export const LoadingCards = ({ count = 6, className = "h-28" }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className={className} />
    ))}
  </div>
)

export const LoadingRows = ({ count = 8 }) => (
  <div className="card divide-y divide-line" aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <Skeleton className="h-7 w-7" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
)

export const ErrorState = ({ onRetry, message }) => (
  <div className="card flex flex-col items-center px-6 py-12 text-center">
    <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-accent">
      <Icon name="alert" className="h-5 w-5" />
    </span>
    <h2 className="mt-4 font-semibold">Couldn't load the data</h2>
    <p className="mt-1 max-w-sm text-sm text-muted">
      {message || "The data source didn't respond. If you're running locally, check that the Flask API is running."}
    </p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn mt-5">
        <Icon name="refresh" />
        Try again
      </button>
    )}
  </div>
)

export const EmptyState = ({ title, children }) => (
  <div className="card px-6 py-12 text-center">
    <h2 className="font-semibold">{title}</h2>
    {children && <div className="mt-1 text-sm text-muted">{children}</div>}
  </div>
)
