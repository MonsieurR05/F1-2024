// Team colour system.
//
// The whole interface is themed by three CSS custom properties on <html>:
//   --team      primary team colour (accents, highlights, glows)
//   --team-2    secondary team colour (gradient partner)
//   --on-team   text colour that is readable on top of --team
// They are registered with @property in global.css, so switching teams animates.

// Each team keeps its own recognisable identity. Primary colours follow the 2024
// broadcast graphics; secondary colours come from each team's livery.
export const TEAM_THEMES = {
  red_bull: { name: "Red Bull", primary: "#3671C6", secondary: "#E4002B" },
  ferrari: { name: "Ferrari", primary: "#E8002D", secondary: "#FFD12E" },
  mclaren: { name: "McLaren", primary: "#FF8000", secondary: "#47C7FC" },
  mercedes: { name: "Mercedes", primary: "#27F4D2", secondary: "#9EA7AE" },
  aston_martin: { name: "Aston Martin", primary: "#229971", secondary: "#CEDC00" },
  alpine: { name: "Alpine", primary: "#FF87BC", secondary: "#0093CC" },
  williams: { name: "Williams", primary: "#64C4FF", secondary: "#1868DB" },
  rb: { name: "RB", primary: "#6692FF", secondary: "#E4002B" },
  sauber: { name: "Sauber", primary: "#52E252", secondary: "#00A19C" },
  haas: { name: "Haas", primary: "#B6BABD", secondary: "#E10600" },
}

// Used when no team is selected
export const DEFAULT_THEME = { name: "Formula 1", primary: "#E10600", secondary: "#FF7A2F" }

export const TEAM_ORDER = [
  "mclaren", "ferrari", "red_bull", "mercedes", "aston_martin",
  "alpine", "haas", "rb", "williams", "sauber",
]

export const getTheme = (teamId) => TEAM_THEMES[teamId] || DEFAULT_THEME

// Black or white text, whichever reads better on the given colour
export const readableOn = (hex) => {
  const value = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
  const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  // 0.179 is where black and white text have equal contrast against the colour
  return luminance > 0.179 ? "#0A0B0E" : "#FFFFFF"
}

// ---------------------------------------------------------------------------
// Applying a theme
// ---------------------------------------------------------------------------

const STORAGE_KEY = "team"
export const TEAM_CHANGE_EVENT = "teamchange"

// Paint the interface in a team's colours (does not change the saved choice)
export const applyTheme = (teamId) => {
  const theme = getTheme(teamId)
  const root = document.documentElement
  root.style.setProperty("--team", theme.primary)
  root.style.setProperty("--team-2", theme.secondary)
  root.style.setProperty("--on-team", readableOn(theme.primary))
  root.dataset.theme = TEAM_THEMES[teamId] ? teamId : ""
}

// The team the visitor picked ("" when none)
export const getSelectedTeam = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return TEAM_THEMES[saved] ? saved : ""
  } catch {
    return ""
  }
}

// Save a choice, repaint, and tell any listening components
export const setSelectedTeam = (teamId) => {
  const id = TEAM_THEMES[teamId] ? teamId : ""
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this page only
  }
  applyTheme(id)
  window.dispatchEvent(new CustomEvent(TEAM_CHANGE_EVENT, { detail: id }))
}
