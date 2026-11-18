// Shared UI building blocks used by every page.
import { useEffect, useState } from "react"
import { getDriverCutoutUrls, getDriverImageUrls, getTeamColor, getTeamLogoUrl, initials, teamCode } from "../utils/f1Data.js"
import { applyTheme } from "../utils/theme.js"

const cx = (...classes) => classes.filter(Boolean).join(" ")

// ---------------------------------------------------------------------------
// Theme hooks
// ---------------------------------------------------------------------------

// Paint the whole page in a team's colours while a component is shown (a team or
// driver page), then return to Formula 1 red
export const useTeamTheme = (teamId) => {
  useEffect(() => {
    if (!teamId) return undefined
    applyTheme(teamId)
    return () => applyTheme("")
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
  <div className="rise mb-10 lg:mb-14">
    <p className="label text-team">{eyebrow}</p>
    <h1 className="display mt-3 text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
    {subtitle && <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">{subtitle}</p>}
  </div>
)

// Section heading with a team stripe, and an optional link on the right
export const SectionHeading = ({ title, action, className }) => (
  <div className={cx("mb-5 flex items-end justify-between gap-3", className)}>
    <h2 className="section-title">{title}</h2>
    {action}
  </div>
)

// A titled section. The heading sits on the page; the body is a flat panel,
// or sits straight on the page when `plain` (tables bring their own bands).
export const Card = ({ title, action, children, className, bodyClassName, plain, as: Tag = "section" }) => (
  <Tag className={className}>
    {(title || action) && <SectionHeading title={title} action={action} />}
    <div className={cx(!plain && "card", bodyClassName ?? (plain ? "" : "p-5 sm:p-6"))}>{children}</div>
  </Tag>
)

// Big hero figure: number over a small label
export const HeroStat = ({ label, value, highlight }) => (
  <div>
    <p className={cx("display text-5xl sm:text-6xl", highlight && "text-team")}>{value}</p>
    <p className="label mt-1.5">{label}</p>
  </div>
)

// Feature panel used at the top of the overview and every detail page: text on
// the left, a team-colour slab on the right, and `art` (driver cutouts) on the slab.
export const HeroFrame = ({ eyebrow, logo, title, sub, stats, actions, art, headingAs: Heading = "h2", className }) => (
  <section className={cx("hero rise", className ?? "min-h-[30rem] sm:min-h-[32rem]")}>
    <div className="relative z-10 flex h-full max-w-[36rem] flex-col p-6 pb-12 sm:p-12">
      {logo && <div className="mb-5">{logo}</div>}
      <p className="label flex items-center gap-2 text-fg">
        <span className="h-3 w-[3px] skew-x-[-12deg] bg-team" aria-hidden="true" />
        {eyebrow}
      </p>
      <Heading className="display mt-5">{title}</Heading>
      {sub && <div className="mt-4 text-sm text-muted">{sub}</div>}

      {stats && (
        <>
          <div className="mt-8 h-[3px] w-full max-w-[22rem] bg-team" aria-hidden="true" />
          <div className="mt-6 flex gap-8 sm:gap-12">{stats}</div>
        </>
      )}

      {actions && <div className="mt-10 flex flex-wrap gap-2">{actions}</div>}
    </div>
    {art}
  </section>
)

// Cutout sizing shared by every hero: faded behind the text below desktop width
export const HERO_CUTOUT = "absolute -right-10 bottom-0 h-[70%] w-auto opacity-40 lg:right-4 lg:h-[104%] lg:opacity-100"

// A single figure. `highlight` paints the value in the team colour; `dotColor`
// colours the rule on its left.
export const StatTile = ({ label, value, hint, highlight, dotColor }) => (
  <div className="min-w-0 border-l-2 border-white/10 pl-4" style={dotColor ? { borderColor: dotColor } : undefined}>
    <p className="label">{label}</p>
    <p className={cx("display mt-2 text-4xl sm:text-5xl", highlight && "text-team")}>
      {value}
    </p>
    {hint && <p className="mt-2 truncate text-sm text-muted">{hint}</p>}
  </div>
)

export const BackLink = ({ onClick, href, children }) => {
  const className = "inline-flex items-center gap-1.5 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted transition-colors hover:text-fg"
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
  <div role="tablist" aria-label={label} className="inline-flex gap-1">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={active === tab.id}
        onClick={() => onChange(tab.id)}
        className={cx(
          "px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors",
          active === tab.id ? "text-fg shadow-[inset_0_-3px_0_var(--team)]" : "text-muted hover:text-fg",
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
    className={cx("inline-block w-[3px] shrink-0 skew-x-[-12deg]", className)}
    style={{ backgroundColor: getTeamColor(constructorId) }}
    aria-hidden="true"
  />
)

// A team's 2024 logo; renders nothing if it has none or it fails to load
export const TeamLogo = ({ constructorId, className = "h-8 w-8" }) => {
  const src = getTeamLogoUrl(constructorId)
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      className={cx("shrink-0 rounded-[3px] object-contain", className)}
      onError={() => setFailed(true)}
    />
  )
}

// Square team badge: the team logo, or the three-letter code ("McLaren" -> "MCL") without one
export const TeamBadge = ({ constructorId, name, size = "md" }) => {
  const color = getTeamColor(constructorId)
  const logo = getTeamLogoUrl(constructorId)
  const [failed, setFailed] = useState(false)
  const box = size === "lg" ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm"

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        className={cx("shrink-0 rounded-[3px] object-contain", box)}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span
      className={cx("grid shrink-0 place-items-center rounded-[2px] font-display font-extrabold uppercase tracking-wide", box)}
      style={{ background: `${color}22`, color, boxShadow: `inset 3px 0 0 ${color}` }}
      aria-hidden="true"
    >
      {teamCode(constructorId, name)}
    </span>
  )
}

// Loads a driver's photo, trying each known URL; src is null once all have failed
const useDriverImage = (driverId, { cutout = false, large = false } = {}) => {
  const urls = cutout ? getDriverCutoutUrls(driverId) : getDriverImageUrls(driverId, { large })
  const [index, setIndex] = useState(0)
  const next = () => setIndex((i) => i + 1)
  return {
    src: index < urls.length ? urls[index] : null,
    onError: next,
    // Some hosts answer hotlinked requests with a 1x1 placeholder instead of an error
    onLoad: (e) => e.currentTarget.naturalWidth < 10 && next(),
  }
}

// Square driver photo that falls back to initials
export const DriverAvatar = ({ driverId, name, constructorId, size = "md" }) => {
  const image = useDriverImage(driverId)
  const color = constructorId ? getTeamColor(constructorId) : "#9CA3AF"
  const sizes = { sm: "h-9 w-9 text-xs", md: "h-14 w-14 text-sm", lg: "h-24 w-24 text-2xl" }

  return (
    <span
      className={cx("relative grid shrink-0 place-items-center overflow-hidden rounded-[2px] font-display font-bold text-muted", sizes[size])}
      style={{ background: `${color}30`, boxShadow: `inset 0 -3px 0 ${color}` }}
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

// Large transparent driver image for hero panels. Without a cutout it renders
// nothing, or with `portrait` the 2024 headshot in a slanted frame on the slab.
export const DriverCutout = ({ driverId, className, portrait = false }) => {
  const cutout = useDriverImage(driverId, { cutout: true })
  const headshot = useDriverImage(driverId, { large: true })

  if (cutout.src) {
    return (
      <img
        src={cutout.src}
        alt=""
        referrerPolicy="no-referrer"
        className={cx("cutout pointer-events-none select-none object-contain object-bottom", className)}
        onError={cutout.onError}
        onLoad={cutout.onLoad}
      />
    )
  }
  if (!portrait || !headshot.src) return null
  return (
    <img
      src={headshot.src}
      alt=""
      referrerPolicy="no-referrer"
      className="hero-portrait pointer-events-none absolute right-[6%] top-[14%] aspect-[4/5] h-[72%] select-none object-cover object-top opacity-40 lg:opacity-100"
      onError={headshot.onError}
      onLoad={headshot.onLoad}
    />
  )
}

// Finishing position chip, with gold / silver / bronze for the podium
export const PositionBadge = ({ position, label }) => {
  const text = label ?? position
  const podium = {
    1: "bg-gold/15 text-gold",
    2: "bg-silver/15 text-silver",
    3: "bg-bronze/15 text-bronze",
  }
  const style = /^\d+$/.test(String(text)) ? podium[Number(text)] || "bg-subtle text-fg" : "bg-danger/15 text-danger"
  return (
    <span className={cx("tabular inline-grid h-8 min-w-[2rem] place-items-center rounded-[2px] px-1.5 font-display text-base font-extrabold", style)}>
      {text}
    </span>
  )
}

// Horizontal bar showing a value relative to a maximum
export const ProgressBar = ({ value, max, color }) => (
  <div className="h-1 w-full overflow-hidden bg-subtle">
    <div
      className="h-full transition-[width] duration-700"
      style={{ width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%`, background: color }}
    />
  </div>
)

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const Skeleton = ({ className }) => <div className={cx("animate-pulse rounded-[2px] bg-subtle", className)} />

export const LoadingCards = ({ count = 6, className = "h-28" }) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className={className} />
    ))}
  </div>
)

export const LoadingRows = ({ count = 8 }) => (
  <div className="card" aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
)

export const ErrorState = ({ onRetry, message }) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center">
    <Icon name="alert" className="h-6 w-6 text-danger" />
    <h2 className="display mt-4 text-3xl">Couldn't load the data</h2>
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
    <h2 className="display text-3xl">{title}</h2>
    {children && <div className="mt-1 text-sm text-muted">{children}</div>}
  </div>
)
